import {
  Button,
  Row,
  Col,
  Layout,
} from 'antd';
import { ArtCard } from '../../components/ArtCard';
import Masonry from 'react-masonry-css';
import { CardLoader } from '../../components/MyLoader';
import { Link, useHistory } from 'react-router-dom';
import useWindowDimensions from '../../utils/layout';
import { useMeta } from '../../contexts';
import { useEffect, useState } from 'react';
const { Content } = Layout;

export const LandingView = () => {
  const { metadata, isLoading } = useMeta();
  const { width } = useWindowDimensions();
  
  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1,
  };
  
  const items = metadata;

  const artworkGrid = (
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className="my-masonry-grid"
      columnClassName="my-masonry-grid_column"
    >
      {!isLoading
        ? items.slice(0, Math.min(items.length, 12)).map((m, idx) => {
            const id = m.pubkey;
            return (
              <Link to={`/art/${id}`} key={idx}>
                <ArtCard
                  key={id}
                  pubkey={m.pubkey}
                  preview={false}
                  height={250}
                  width={250}
                />
              </Link>
            );
          })
        : [...Array(12)].map((_, idx) => <CardLoader key={idx} />)}
    </Masonry>
  );

  return (
    <>
      <Content style={{width: '100%'}}>
      {width < 750 ?
      <Row>
        <Col span={24}>
          <div style={{ width: '100%' }}>
            <div
              className="image-stack"
              style={{
                margin: '12px auto',
                fontSize: 18,
                width: '10rem',
                height: '10rem',
              }}
            >
              <div className="stack-item">
                {<img className="item-img" src="/img/logo.gif" />}
              </div>
            </div>
          </div>
        </Col>
        <Col span={24}>
          <div className="auction-container" style={{ margin: 0 }}>
          <div className="container d-flex align-items-center flex-column" style={{ width: '100%', marginTop: '2rem' }}>
              {/* <!-- Masthead Heading--> */}
              <h1 className="masthead-heading text-uppercase mb-0">Pogs On The Blockchain</h1>
              {/* <!-- Icon Divider--> */}
              <div className="divider-custom divider-light">
                  <div className="divider-custom-line"></div>
                  <div className="divider-custom-icon"><svg className="svg-inline--fa fa-star fa-w-18" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="star" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" data-fa-i2svg=""><path fill="currentColor" d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z"></path></svg>
                  {/* <!-- <i className="fas fa-star"></i> Font Awesome fontawesome.com --> */}
                  </div>
                  <div className="divider-custom-line"></div>
              </div>
              {/* <!-- Masthead Subheading--> */}
              <p className="masthead-subheading font-weight-light mb-0">Solana Pogs are collectable NFTs that you can play for keeps!</p>
              <p className="masthead-subheading font-weight-light mb-0"><b>Coming this September</b></p>
            </div>
          </div>
        </Col>
      </Row>
      :
      <Row>
        <Col span={18}>
          <div className="auction-container" style={{ margin: 0 }}>
            <div className="container d-flex align-items-center flex-column" style={{ width: '100%', marginTop: '2rem' }}>
              {/* <!-- Masthead Heading--> */}
              <h1 className="masthead-heading text-uppercase mb-0">Pogs On The Blockchain</h1>
              {/* <!-- Icon Divider--> */}
              <div className="divider-custom divider-light">
                  <div className="divider-custom-line"></div>
                  <div className="divider-custom-icon"><svg className="svg-inline--fa fa-star fa-w-18" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="star" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" data-fa-i2svg=""><path fill="currentColor" d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z"></path></svg>
                  {/* <!-- <i className="fas fa-star"></i> Font Awesome fontawesome.com --> */}
                  </div>
                  <div className="divider-custom-line"></div>
              </div>
              {/* <!-- Masthead Subheading--> */}
              <p className="masthead-subheading font-weight-light mb-0">Solana Pogs are collectable NFTs that you can play for keeps!</p>
              <p className="masthead-subheading font-weight-light mb-0"><b>Coming this September</b></p>
            </div>
          </div>
        </Col>
        <Col span={6}>
          <div style={{ width: '100%' }}>
            <div
              className="image-stack"
              style={{
                margin: '12px auto',
                fontSize: 18,
                width: '10rem',
                height: '10rem',
              }}
            >
              <div className="stack-item">
                {<img className="item-img" src="/img/logo.gif" />}
              </div>
            </div>
          </div>
        </Col>
      </Row>
      }
      <Col>
        <div className="auction-container" style={{ margin: 0, marginTop: '3rem' }}>
          <div style={{ width: '100%', marginTop: '2rem' }}>
            {artworkGrid}
          </div>
        </div>
      </Col>
      </Content>
    </>
  );
};
