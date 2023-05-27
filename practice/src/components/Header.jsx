import React from 'react';

const Header = (props) => {
  const {children} = props;
  return (
    <div>
      <h1>헤더 컴포넌트입니당</h1>
      {children}
    </div>
  );
};

export default Header;