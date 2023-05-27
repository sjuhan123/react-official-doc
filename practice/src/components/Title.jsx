import React from 'react';

const Title = (props) => {
  const {children, color} = props;
  return (
    <div>
      <h2 style={{color}}>타이틀 컴포넌트입니당</h2>
      {children}
    </div>
  );
};

export default Title;