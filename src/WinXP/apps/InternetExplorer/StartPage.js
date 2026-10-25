import React from 'react';
import styled from 'styled-components';

export default function StartPage({ onSearchDemo }) {
  return (
    <Page>
      <p className="eyebrow">VECTOR INDEX / PERSONAL DESKTOP</p>
      <h1>Hello, I’m Sean.</h1>
      <p className="name">Yuxiao Li · yuxiaoli</p>
      <p>
        I build developer tools, cloud services and AI applications, connecting
        engineering with international technology collaboration.
      </p>
      <nav aria-label="Sean’s public links">
        <a
          href="https://vectorindex.cloud"
          target="_blank"
          rel="noopener noreferrer"
        >
          Visit Vector Index ↗
        </a>
        <a
          href="https://github.com/yuxiaoli"
          target="_blank"
          rel="noopener noreferrer"
        >
          Explore my GitHub ↗
        </a>
        <a
          href="https://github.com/yuxiaoli/winXP"
          target="_blank"
          rel="noopener noreferrer"
        >
          This desktop’s source ↗
        </a>
      </nav>
      <p className="hint">
        Open Notepad for a short introduction, or enjoy the classic desktop
        apps.
      </p>
      <button onClick={onSearchDemo}>Try the search demo</button>
      <p className="credit">
        Windows XP recreation originally by{' '}
        <a
          href="https://github.com/ShizukuIchi/winXP"
          target="_blank"
          rel="noopener noreferrer"
        >
          ShizukuIchi
        </a>
        .
      </p>
    </Page>
  );
}

const Page = styled.main`
  padding: 32px;
  max-width: 720px;
  margin: 0 auto;
  color: #25364a;
  font: 14px/1.65 Tahoma, sans-serif;
  .eyebrow {
    color: #597282;
    font-size: 10px;
    letter-spacing: 1.4px;
  }
  h1 {
    margin: 18px 0 0;
    font: bold 32px/1.2 Georgia, serif;
    color: #164b77;
  }
  .name {
    margin: 7px 0 20px;
    color: #597282;
  }
  nav {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 9px;
    margin: 24px 0;
  }
  a {
    color: #155c9b;
    text-decoration: underline;
  }
  a:hover {
    color: #003c70;
  }
  .hint,
  .credit {
    font-size: 12px;
    color: #607080;
  }
  button {
    padding: 5px 10px;
    margin: 0 0 16px;
    cursor: pointer;
  }
  .credit {
    border-top: 1px solid #ccd5dc;
    padding-top: 15px;
  }
`;
