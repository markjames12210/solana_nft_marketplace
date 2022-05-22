import React, { useEffect, useState, useCallback, useRef } from 'react';
import VideoPlayer from "react-background-video-player";
import axios from 'axios';
import { notify, sleep } from '@oyster/common';
import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  Layout,
  List,
  Progress,
  Row,
  Slider,
  Space,
  Spin,
  Statistic,
  Steps,
  Typography,
  Upload,
} from 'antd';
import { ArtCard } from './../../components/ArtCard';
import { UserSearch, UserValue } from './../../components/UserSearch';
import { Confetti } from './../../components/Confetti';
import { mintNFT } from '../../actions';
import { useCoingecko } from '../../contexts';
import {
  MAX_METADATA_LEN,
  useConnection,
  IMetadataExtension,
  Attribute,
  MetadataCategory,
  useConnectionConfig,
  Creator,
  shortenAddress,
  MetaplexModal,
  MetaplexOverlay,
  MetadataFile,
  StringPublicKey,
} from '@oyster/common';
import { useWallet } from '@solana/wallet-adapter-react';
import { getAssetCostToStore, LAMPORT_MULTIPLIER } from '../../utils/assets';
import { Connection } from '@solana/web3.js';
import { MintLayout } from '@solana/spl-token';
import { useHistory, useParams } from 'react-router-dom';
import { cleanName, getLast } from '../../utils/utils';
import { AmountLabel } from '../../components/AmountLabel';
import useWindowDimensions from '../../utils/layout';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { baseURL } from '../../config/api';
import { needMetadataUpdate, setNeedMetadataUpdate } from '../../actions/nft';
import { delay } from 'lodash';

const { Step } = Steps;
const { Dragger } = Upload;
const { Text } = Typography;
const poorPirceLimit = 4555;
const totalNFTLimit = 5555;

export const ArtCreateView = () => {
  const connection = useConnection();
  const { env } = useConnectionConfig();
  const wallet = useWallet();
  const { step_param }: { step_param: string } = useParams();
  const history = useHistory();
  const { width } = useWindowDimensions();
  const { totalNFTs } = useCoingecko();

  const [step, setStep] = useState<number>(0);
  const [cost, setCost] = useState<number>(0.00);
  const [approved, setApproved] = useState<boolean>(false);
  const [stepsVisible, setStepsVisible] = useState<boolean>(false);//true);
  const [progress, setProgress] = useState<number>(0);
  const [nft, setNft] =
    useState<{ metadataAccount: StringPublicKey } | undefined>(undefined);
  const [files, setFiles] = useState<File[]>([]);
  const [pogFile, setPogFile] = useState<File>();
  const [attributes, setAttributes] = useState<IMetadataExtension>({
    name: '',
    symbol: '',
    description: '',
    external_url: '',
    image: '',
    animation_url: undefined,
    attributes: undefined,
    seller_fee_basis_points: 0,
    creators: [],
    properties: {
      files: [],
      category: MetadataCategory.Image,
    },
  });

  const gotoStep = useCallback(
    (_step: number) => {
      history.push(`/art/create/${_step.toString()}`);
      if (_step === 0) setStepsVisible(false);
    },
    [history],
  );

  useEffect(() => {
    if (totalNFTs >= totalNFTLimit) {
      notify({
        message: 'All Pogs are already minted',
        description: (
          <p>
            Could not mint Solana Pog NFT at this Moment <br /> There are already {totalNFTLimit} NFTs!
          </p>
        ),
        type: 'warning',
      });
      history.push('/');
    }
  }, []);
  
  useEffect(() => {
    if (step_param) setStep(parseInt(step_param));
    else gotoStep(0);
    
    const key = wallet.publicKey?.toBase58();
    const ownerKey = `${process.env.NEXT_PUBLIC_PREMINTER_ADDRESS}`;
    console.log(`==> Preminter address is ${ownerKey}`);
    if (parseInt(step_param) === 7 && key !== ownerKey) history.push('/');
  }, [step_param, gotoStep]);

  // store files
  const mint = async (isPremint?: boolean) => {
    const metadata = {
      name: attributes.name,
      symbol: attributes.symbol,
      creators: attributes.creators,
      description: attributes.description,
      sellerFeeBasisPoints: attributes.seller_fee_basis_points,
      image: attributes.image,
      animation_url: attributes.animation_url,
      attributes: attributes.attributes,
      external_url: attributes.external_url,
      properties: {
        files: attributes.properties.files,
        category: attributes.properties?.category,
      },
    };
    //setStepsVisible(false); 
    setApproved(false);

    const intervalStart = (max) => {
      return setInterval(
        () => setProgress(prog => Math.min(prog + 1, max)),
        600,
      );
    }
    
    let inte = intervalStart(3);
      // Update progress inside mintNFT
    try {
      const progressCallBack = (maxValue) => {
        setApproved(true);
        clearInterval(inte);
        if (maxValue === 96) setProgress(81);
        else if (maxValue === 99) setProgress(96);
        setTimeout(() => {
          inte = intervalStart(maxValue);
        }, 100);
        console.log(`Callback Value --> ${maxValue}`);
      };
      const _nft = await mintNFT(
        connection,
        wallet,
        env,
        files,
        metadata,
        attributes.properties?.maxSupply,
        progressCallBack,
        totalNFTs <= totalNFTLimit,
        isPremint,
      );
      setProgress(99);
      await sleep(500);
      if (_nft) setNft(_nft);
    } catch (e) {
      console.log('Error occured ===>');
      console.log(e);
      
      notify({
        message: 'Minting Error',
        description: (
          <p>
            Could not mint NFT on Solana at this Moment <br /> Try again later!
          </p>
        ),
        type: 'warning',
      });
      throw e;
    } finally {
      clearInterval(inte);
    }
  };

  return (
    <>
      <Row style={{ paddingTop: 50 }}>
        <Col span={24} {...(stepsVisible ? { md: 20 } : { md: 24 })}>
          {step <= 4 && (
            <LaunchStep
              attributes={attributes}
              setAttributes={setAttributes}
              files={files}
              setFiles={setFiles}
              setPogFile={setPogFile}
              confirm={() => { gotoStep(5); }}
            />
          )}
          {step === 5 && (
            <WaitingStep
              mint={mint}
              attributes={attributes}
              files={files}
              pogFile={pogFile}
              nft={nft}
              progress={progress}
              approved={approved}
            />
          )}
          {step === 7 && (
            <PremintStep
              attributes={attributes}
              setAttributes={setAttributes}
              files={files}
              setFiles={setFiles}
              mint={mint}
            />
          )}
        </Col>
      </Row>
    </>
  );
};

interface Royalty {
  creatorKey: string;
  amount: number;
}

const LaunchStep = (props: {
  confirm: () => void;
  attributes: IMetadataExtension;
  setAttributes: (attr: IMetadataExtension) => void;
  files: File[];
  setFiles: (files: File[]) => void;
  setPogFile: (file: File) => void;
}) => {
  const { publicKey, connected } = useWallet();
  const [creators, setCreators] = useState<Array<UserValue>>([]);
  const [royalties, setRoyalties] = useState<Array<Royalty>>([]);
  const [fixedCreators, setFixedCreators] = useState<Array<UserValue>>([]);
  const { totalNFTs } = useCoingecko();
  useEffect(() => {
    if (publicKey) {
      const key = publicKey.toBase58();
      const addr = process.env.NEXT_PUBLIC_STORE_OWNER_ADDRESS;
      const ownerKey = `${addr}`;//`F${addr?.substr(0, addr.length - 1)}`;
      let creatorlist = [{
        key,
        label: shortenAddress(key),
        value: key,
      }];
      if (key !== ownerKey)
        creatorlist.push({
          key: ownerKey,
          label: shortenAddress(ownerKey),
          value: ownerKey,
        });
      setFixedCreators(creatorlist);
    }
  }, [connected, setCreators]);
  useEffect(() => {
    setRoyalties(
      [...fixedCreators, ...creators].map(creator => ({
        creatorKey: creator.key,
        amount: Math.trunc(100 / [...fixedCreators, ...creators].length),
      })),
    );
  }, [creators, fixedCreators]);
  const handlePay = () => {
    try {
      axios.post(`${baseURL}/api/generate`).then( async (response) => {
        console.log('random pog generated', response)
        const resData = response.data.result;
        if ( resData === undefined) return;
        else {
          const imageUrl = `${baseURL}/${resData.image}`;
          const imagePogUrl = imageUrl.replace('.png', '_pog.png');
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          const imageFile = new File([blob], resData.image, { type: blob.type });
          const pogResponse = await fetch(imagePogUrl);
          const pogBlob = await pogResponse.blob();
          const imagePogFile = new File([pogBlob], resData.image.replace('.png', '_pog.png'), { type: pogBlob.type });
          const nftAttr = resData.attributes;
          nftAttr.push({trait_type: 'rarity', value: resData.rarity});
          
          const creatorStructs: Creator[] = [
            ...fixedCreators,
            ...creators,
          ].map(
            c =>
              new Creator({
                address: c.value,
                verified: c.value === publicKey?.toBase58(),
                share:
                  royalties.find(r => r.creatorKey === c.value)?.amount ||
                  Math.round(100 / royalties.length),
              }),
          );

          const share = creatorStructs.reduce(
            (acc, el) => (acc += el.share),
            0,
          );
          if (share > 100 && creatorStructs.length) {
            creatorStructs[0].share -= share - 100;
          }
          props.setAttributes({
            ...props.attributes,
            name: resData.name,
            properties: {
              ...props.attributes.properties,
              category: MetadataCategory.Image,
              files: [imageFile, undefined, undefined]
              .filter(f => f)
              .map(f => {
                const uri = typeof f === 'string' ? f : f?.name || '';
                const type =
                  typeof f === 'string' || !f
                    ? 'unknown'
                    : f.type || getLast(f.name.split('.')) || 'unknown';

                return {
                  uri,
                  type,
                } as MetadataFile;
              }),
            },
            image: imageFile?.name || '',
            animation_url: '',
            creators: creatorStructs,
            attributes: nftAttr,
          });
          props.setFiles([imageFile, undefined].filter(f => f) as File[]);
          props.setPogFile(imagePogFile);

          axios.post(`${baseURL}/api/remove`, {name: resData.image})
          axios.post(`${baseURL}/api/remove`, {name: resData.image.replace('.png', '_pog.png')})
          props.confirm();
        }
      });
    } catch (e) {
      console.log("Couldn't connect to api server");
    }
  };

  return (
    <>
      <Row className="call-to-action">
        <h2>Mint your Solana Pogs NFT</h2>
        <p>
        Current Minting Price:  {totalNFTs < poorPirceLimit ? 0.5 : 1} SOL {totalNFTs}/5555 Solana Pogs NFTs remain
        </p>
      </Row>
      <Row>
        <Button
          disabled={totalNFTs >= totalNFTLimit}
          type="primary"
          size="large"
          onClick={handlePay}
          className="action-btn"
        >
          Pay with SOL
        </Button>
        {/* <Button
          disabled={true}
          size="large"
          onClick={handlePay}
          className="action-btn"
        >
          Pay with Credit Card
        </Button> */}
      </Row>
    </>
  );
};

const WaitingStep = (props: {
  mint: Function;
  progress: number;
  nft?: {
    metadataAccount: StringPublicKey;
  };
  attributes: IMetadataExtension;
  files: File[];
  pogFile?: File;
  approved: boolean;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [playable, setPlayable] = useState(false);
  const [complete, setComplete] = useState(false);
  const [videoSource, setVideoSource] = useState("/video/start.mp4");
  const [thumbSource, setThumbSource] = useState("/img/thumb.png");
  const [imageSource, setImageSource] = useState("");
  // const [waitTillMetadatUpdated, setWaitTillMetadataUpdated] = useState(false);
  // const [isWaiting, setIsWaiting] = useState(false);
  const history = useHistory();
  const wallet = useWallet();
  const vidRef = useRef<HTMLVideoElement>(null);
  const { width } = useWindowDimensions();
  const key = wallet.publicKey?.toBase58();
  const ownerKey = `${process.env.NEXT_PUBLIC_PREMINTER_ADDRESS}`;

  useEffect(() => {
    // if (cost === 0) return;
    // console.log('cost calculated');
    const func = async () => {
      try {
        if (key === ownerKey) {
          console.log('You are Pre-minter. Able to premint');
        }
        await props.mint(key === ownerKey);
        if (key === ownerKey) return;
        setNeedMetadataUpdate(true);
        // props.confirm();
        setIsLoading(false);
        console.log('--> Received ', props.approved)
        // if (props.approved) {
          setVideoSource("/video/end.mp4");
          setComplete(true);
        // }
      } catch {
        history.push('/art/create/0');
        setNeedMetadataUpdate(false);
      } finally {
        // setIsWaiting(false);
        // setWaitTillMetadataUpdated(false);
      }
    };
    setComplete(key === ownerKey);//false);
    setPlayable(false);
    setIsLoading(false);
    setNeedMetadataUpdate(false);
    console.log('--> Start mint')
    func();
  }, []);

  useEffect(() => {
    const file = props.pogFile;
    if (!file) return;
    const imageUrl = URL.createObjectURL(file);
    setImageSource(imageUrl);
  }, [props.pogFile]);

  useEffect(() => {
    const isApproved = props.approved;
    if (!isApproved) return;
    if (vidRef.current) {
      vidRef.current.play();
      setThumbSource("/img/trans.png");
    }
  }, [props.approved]);

  const handleMainVideoEnded = ()=>{
    if (complete) return;
    setVideoSource("/video/loop.mp4");
    setIsLoading(true);
    setPlayable(true);
   }

  return (
    <div
      style={{
        marginTop: width > 550 ? 70 : 0,
        paddingTop: '18%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        minHeight: width < 1100 ? '54vw' : '594px',
        width: '100%',
      }}
    >
      <VideoPlayer
        className="w-100"
        src={videoSource}
        ref={vidRef}
        poster={thumbSource}
        autoPlay={playable}
        loop={isLoading}
        style={{
          position: 'absolute',
          height: '100%',
          top: 0,
          left: '50%',
          transform: 'translate(-50%, 0)',
          zIndex: 0,
        }}
        onEnd={handleMainVideoEnded}
      />
      {!complete ? (
        <>
          <Progress type="circle" percent={props.progress} />
          <div className="waiting-title" style={{
            fontSize: width < 865 ? '1rem' : '2rem',
            zIndex: 0,
          }}>
            Minting in progress...
          </div>
          <div className="waiting-subtitle" style={{
            fontSize: width < 865 ? '0.8rem' : '1rem',
            zIndex: 0,
          }}>
            IMPORTANT: Do not leave this page. You will need to approve again to receive your NFT
          </div>
        </>
      ) : (
        <>
          <div
            className="w-100"
            style={{
              height: width < 1100 ? '54vw' : '594px',
              position: 'absolute',
              top: 0,
              left: 0,
              zIndex: 100,
            }}
          >
            <img
              src={imageSource}
              style={{
                top: width < 1100 ? '11vw' : '121px',
                position: 'absolute',
                left: '50%',
                width: width < 1100 ? '41vw' : '451px',
                transform: 'translateX(-52%)',
              }}
            />
          </div>
          <div className="congrats-button-container" style={{
            position: 'absolute',
            top: width < 1100 ? '50vw' : '550px',
            left: '50%',
            transform: 'translate(-50%, 0)',
            zIndex: 0,
          }}>
            <Button
              className=""
              onClick={_ =>
                history.push(`/art/${props.nft?.metadataAccount.toString()}`)
              }
            >
              <span>See it in your collection</span>
              <span>&gt;</span>
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

const PremintStep = (props: {
  attributes: IMetadataExtension;
  setAttributes: (attr: IMetadataExtension) => void;
  files: File[];
  setFiles: (files: File[]) => void;
  mint: Function;
  nft?: {
    metadataAccount: StringPublicKey;
  };
}) => {
  const { publicKey, connected } = useWallet();
  const history = useHistory();
  const { width } = useWindowDimensions();
  const [step, setStep] = useState<number>(1);
  const [mintData, setMintData] = useState<Array<Object>>([]);
  const [confirm, setConfirm] = useState<boolean>(false);
  const [startMint, setStartMint] = useState<boolean>(false);
  const [creators, setCreators] = useState<Array<UserValue>>([]);
  const [royalties, setRoyalties] = useState<Array<Royalty>>([]);
  const [fixedCreators, setFixedCreators] = useState<Array<UserValue>>([]);
  useEffect(() => {
    if (publicKey) {
      const key = publicKey.toBase58();
      const addr = process.env.NEXT_PUBLIC_STORE_OWNER_ADDRESS;
      const ownerKey = `${addr}`;//`F${addr?.substr(0, addr.length - 1)}`;
      let creatorlist = [{
        key,
        label: shortenAddress(key),
        value: key,
      }];
      if (key !== ownerKey)
        creatorlist.push({
          key: ownerKey,
          label: shortenAddress(ownerKey),
          value: ownerKey,
        });
      setFixedCreators(creatorlist);
    }
  }, [connected, setCreators]);
  useEffect(() => {
    setStep(1);
    setStartMint(false);
    setNeedMetadataUpdate(false);
    setConfirm(false);
    setRoyalties(
      [...fixedCreators, ...creators].map(creator => ({
        creatorKey: creator.key,
        amount: Math.trunc(100 / [...fixedCreators, ...creators].length),
      })),
    );
  }, [creators, fixedCreators]);

  useEffect(() => {
    if (!royalties.length) return;
    if (!confirm) return;
    if (!startMint) handlePay();
  }, [royalties, confirm]);

  useEffect(() => {
    if (!royalties.length) return;
    if (!startMint) return;
    console.log('--> Start mint')
    func();
  }, [props.attributes]);

  useEffect(() => {
    if (!startMint) return;
    if (step - 1 >= mintData.length) {
      console.log('Error out of index while preminting');
      return;
    }
    console.log('--> premint data');
    console.log(mintData[step - 1]);
    premint(mintData[step - 1]);
  }, [startMint, step]);
  
  const func = async () => {
    try {
      await props.mint(true);
      await sleep(4000);
    } catch {
      // history.push('/art/create/0');
      // setNeedMetadataUpdate(false);
    } finally {
      if (step === 9) {
        setNeedMetadataUpdate(true);
        history.push('/');
      }
      setStep(step + 1);
    }
  };

  const premint = async (resData) => {
    const imageUrl = `${baseURL}/${resData.image}`;
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const imageFile = new File([blob], resData.image, { type: blob.type });
      const nftAttr = resData.attributes;
      nftAttr.push({trait_type: 'rarity', value: resData.rarity});
      
      axios.post(`${baseURL}/api/remove`, {name: resData.image}).then(() => {});

      // if (step === 7) {
      //   console.log(`===> ${step} is preminting`);
      // } else if (step === 9) {
      //   setNeedMetadataUpdate(true);
      //   history.push('/');
      //   return;
      // } else {
      //   setStep(step + 1);
      //   return;
      // };

      const creatorStructs: Creator[] = [
        ...fixedCreators,
        ...creators,
      ].map(
        c =>
          new Creator({
            address: c.value,
            verified: c.value === publicKey?.toBase58(),
            share:
              royalties.find(r => r.creatorKey === c.value)?.amount ||
              Math.round(100 / royalties.length),
          }),
      );

      const share = creatorStructs.reduce(
        (acc, el) => (acc += el.share),
        0,
      );
      if (share > 100 && creatorStructs.length) {
        creatorStructs[0].share -= share - 100;
      }
      props.setFiles([imageFile, undefined].filter(f => f) as File[]);
      props.setAttributes({
        ...props.attributes,
        name: resData.name,
        properties: {
          ...props.attributes.properties,
          category: MetadataCategory.Image,
          files: [imageFile, undefined, undefined]
          .filter(f => f)
          .map(f => {
            const uri = typeof f === 'string' ? f : f?.name || '';
            const type =
              typeof f === 'string' || !f
                ? 'unknown'
                : f.type || getLast(f.name.split('.')) || 'unknown';

            return {
              uri,
              type,
            } as MetadataFile;
          }),
        },
        image: imageFile?.name || '',
        animation_url: '',
        creators: creatorStructs,
        attributes: nftAttr,
      });
    } catch (e) {
      console.log('custom image is not generated yet');
    }
  }

  const handlePay = () => {
    try {
      axios.post(`${baseURL}/api/generate-premint`).then( async (response) => {
        console.log('random pog generated', response)
        const resData = response.data.result;
        if ( resData === undefined) return;
        setMintData(resData);
        setStartMint(true);
      });
    } catch (e) {
      console.log("Couldn't connect to api server");
    }
  };

  return (
    <>
      <Layout style={{ margin: 0, marginTop: 30, alignItems: 'center', textAlign: 'center', }}>
        { !confirm ? (
          <>
            <p>
            Are you sure? This will post Solana Pogs to mainnet and pre-mint Sol pogs!
            </p>
            <p>
              <Button
                className="app-btn"
                type="primary"
                style={{ marginRight: '1rem' }}
                onClick={() => setConfirm(true)}
              >
                Continue
              </Button>
              <Button
                onClick={() => history.push('/admin')}
              >
                Cancel
              </Button>
            </p>
            <Row style={{ paddingTop: 50, width: '100%' }}>
              <Col span={24}>
                <Steps
                  progressDot
                  direction={width > 768 ? 'horizontal' : 'vertical'}
                  current={step}
                  style={{
                    width: 'fit-content',
                    margin: '0 auto 30px auto',
                    overflowX: 'auto',
                    maxWidth: '100%',
                  }}
                >
                  <Step title="Init" />
                  <Step title="1th" />
                  <Step title="2th" />
                  <Step title="3th" />
                  <Step title="4th" />
                  <Step title="5th" />
                  <Step title="6th" />
                  <Step title="7th" />
                  <Step title="8th" />
                  <Step title="9th" />
                </Steps>
              </Col>
            </Row>
          </>
        ) : (
          <>
            <p>
            IMPORTANT: Do not leave this page.<br />You will need to approve again to pre-mint the {step}th Custom Pog.
            </p>
            <Row style={{ paddingTop: 50, width: '100%' }}>
              <Col span={24}>
                <Steps
                  progressDot
                  direction={width > 768 ? 'horizontal' : 'vertical'}
                  current={step}
                  style={{
                    width: 'fit-content',
                    margin: '0 auto 30px auto',
                    overflowX: 'auto',
                    maxWidth: '100%',
                  }}
                >
                  <Step title="Init" />
                  <Step title="1th" />
                  <Step title="2th" />
                  <Step title="3th" />
                  <Step title="4th" />
                  <Step title="5th" />
                  <Step title="6th" />
                  <Step title="7th" />
                  <Step title="8th" />
                  <Step title="9th" />
                </Steps>
              </Col>
            </Row>
          </>
        )}
      </Layout>
    </>
  );
};