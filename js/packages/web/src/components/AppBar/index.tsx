import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button, Dropdown, Menu } from 'antd';
import { ConnectButton, CurrentUserBadge } from '@oyster/common';
import { useWallet } from '@solana/wallet-adapter-react';
import { Notifications } from '../Notifications';
import useWindowDimensions from '../../utils/layout';
import { MenuOutlined } from '@ant-design/icons';
import { useMeta } from '../../contexts';

const UserActions = () => {
  const { publicKey } = useWallet();
  const { whitelistedCreatorsByCreator, store } = useMeta();
  const pubkey = publicKey?.toBase58() || '';

  const canCreate = useMemo(() => {
    return (
      store?.info?.public ||
      whitelistedCreatorsByCreator[pubkey]?.info?.activated
    );
  }, [pubkey, whitelistedCreatorsByCreator, store]);

  return (
    <>
      {store && (
        <>
          {/* <Link to={`#`}>
            <Button className="app-btn">Bids</Button>
          </Link> */}
          {canCreate ? (
            <Link to={`/art/create`}>
              <Button className="app-btn">MINT</Button>
            </Link>
          ) : null}
          {pubkey === process.env.NEXT_PUBLIC_PREMINTER_ADDRESS ? (
            <Link to={`/art/create/7`}>
              <Button className="connector" type="primary">
                PRE-MINT
              </Button>
            </Link>
          ) : null}
        </>
      )}
    </>
  );
};

const DefaultActions = ({ vertical = false }: { vertical?: boolean }) => {
  const { connected } = useWallet();
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: vertical ? 'column' : 'row',
      }}
    >
      <Link to={`/roadmap`}>
        <Button className="app-btn">ROADMAP</Button>
      </Link>
      <Link to={`/faq`}>
        <Button className="app-btn">FAQ</Button>
      </Link>
      <Link to={`/artworks`}>
        <Button className="app-btn">
          {connected ? 'MY ITEM' : 'ITEMS'}
        </Button>
      </Link>
      <Link to={`/artists`}>
        <Button className="app-btn">GALLERY</Button>
      </Link>
      <Link to={`/leaderboard`}>
        <Button className="app-btn">LEADERBOARD</Button>
      </Link>
      {/* <Link to={`/marketplace`}>
        <Button className="app-btn">MARKETPLACE</Button>
      </Link> */}
    </div>
  );
};

const MetaplexMenu = () => {
  const { width } = useWindowDimensions();
  const { connected } = useWallet();

  if (width < 1166)
    return (
      <>
        <Dropdown
          arrow
          placement="bottomLeft"
          trigger={['click']}
          overlay={
            <Menu>
              <Menu.Item>
                <Link to={`/roadmap`}>
                  <Button className="app-btn">ROADMAP</Button>
                </Link>
              </Menu.Item>
              <Menu.Item>
                <Link to={`/faq`}>
                  <Button className="app-btn">FAQ</Button>
                </Link>
              </Menu.Item>
              <Menu.Item>
                <Link to={`/artworks`}>
                  <Button className="app-btn">
                    {connected ? 'MY ITEM' : 'ITEMS'}
                  </Button>
                </Link>
              </Menu.Item>
              <Menu.Item>
                <Link to={`/artists`}>
                  <Button className="app-btn">GALLERY</Button>
                </Link>
              </Menu.Item>
              <Menu.Item>
                <Link to={`/leaderboard`}>
                  <Button className="app-btn">LEADERBOARD</Button>
                </Link>
              </Menu.Item>
              <Menu.Item>
                <Link to={`/marketplace`}>
                  <Button className="app-btn">MARKECTPLACE</Button>
                </Link>
              </Menu.Item>
            </Menu>
          }
        >
          <MenuOutlined style={{ fontSize: '1.4rem' }} />
        </Dropdown>
      </>
    );

  return <DefaultActions />;
};

export const AppBar = () => {
  const { connected } = useWallet();

  return (
    <>
      <div className="app-left app-bar-box">
        {
          window.location.hash !== '#/analytics' &&
          <Notifications />
        }
        <div className="divider" />
        <MetaplexMenu />
      </div>
      {connected ? (
        <div className="app-right app-bar-box">
          <UserActions />
          <CurrentUserBadge
            showBalance={false}
            showAddress={false}
            iconSize={24}
          />
        </div>
      ) : (
        <ConnectButton type="primary" allowWalletChange />
      )}
    </>
  );
};
