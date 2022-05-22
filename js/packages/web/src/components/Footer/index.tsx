import React from 'react';
import { GithubOutlined, TwitterOutlined } from '@ant-design/icons';
import { Button, Col } from 'antd';

export const Footer = () => {
  return (
    <div className={'footer'}>
      <Col style={{
        textAlign: 'center',
        marginTop: '1rem',
      }}>
      {/* SOLANA POGS: The first NFTs on Solana! */}
      </Col>
      <Button
        shape={'circle'}
        target={'_blank'}
        href={'https://github.com/metaplex-foundation/metaplex'}
        icon={<GithubOutlined />}
        style={{
          marginRight: '20px', 
          display: 'inline-flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      ></Button>
      <Button
        shape={'circle'}
        target={'_blank'}
        href={'https://twitter.com/solanapogs'}
        icon={<TwitterOutlined />}
        style={{ 
          display: 'inline-flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      ></Button>
    </div>
  );
};
