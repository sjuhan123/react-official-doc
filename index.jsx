import { Fragment, useEffect, useRef, useState } from 'react';
import { useResolvedPath } from 'react-router-dom';

import useFetch from '@Hooks/useFetch';

import { Product } from '@Types/index';

import { ProductItem } from './ProductItem';
import * as S from './style';
import { layoutType } from '../NavBar/style';
interface ProductListProps {
itemData: Product[];
}

interface ListProps {
  statusCode: number;
  message: string;
  data: {
  products: Product[];
};
}

export const ProductList = ({ itemData }: ProductListProps) => {
  const productListRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [height, setHeight] = useState(window.innerHeight);
  const [Products, setProducts] = useState<Product[]>(itemData);

  // const { data, fetchData } = useFetch<ListProps>(
  // `http://3.38.73.117:8080/api/products?page=${page}&size=10`,
  // );

  useEffect(() => {
    const handleScroll = () => {
      if (productListRef.current) {
        const { bottom } = productListRef.current.getBoundingClientRect();
        console.log(bottom);
        if (bottom <= height && !isLoading) {
        console.log(height);
        loadMoreData();
      }
    }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
    window.removeEventListener('scroll', handleScroll);
    };
  }, [isLoading]);


  // 90 -> 100
  // true -> 비동기
  const loadMoreData = async () => {
  setIsLoading(true);
  // console.log(
  // 'url',
  // `http://3.38.73.117:8080/api/products?page=${page}&size=10`,
  // );
  // await fetchData({
  // url: `http://3.38.73.117:8080/api/products?page=${page}&size=10`,
  // isGetData: true,
  // });
  await fetch(`http://3.38.73.117:8080/api/products?page=${page}&size=10`)
  .then((response) => response.json())
  .then((productsData) => {
  if (productsData !== undefined) {
    const newData = productsData?.data.products;

    setPage((prevData) => {
    const updatedPage = prevData + 1;
    console.log('실제페이지', updatedPage);
    return updatedPage;
  });
    setProducts((prevData) => {
    const updatedData = [...prevData, ...newData];
    console.log('실제데이터', updatedData);
    return updatedData;
  });
  // setHeight((prevData) => {
  // const updatedHeight = prevData * (2 + page);
  // console.log('실제 길이', prevData, updatedHeight);
  // return updatedHeight;
  // });
  }
  setIsLoading(false);
  });
  // .catch((error) => {
  // console.error('Error:', error);
  // setIsLoading(false);
  // });
  };

  return (
  <S.Layout ref={productListRef}>
  <S.TopBox />
  {Products &&
  Products.map((product) => (
  <Fragment key={product.productId}>
  <ProductItem
  imageUrl={product.mainImage.imageUrl}
  title={product.title}
  city={product.location.city}
  town={product.location.town}
  createdAt={product.createdAt}
  price={product.price}
  watchlistCounts={product.watchlistCounts}
  chatroomCounts={product.chatroomCounts}
  status={product.status}
  isCategory={true}
  isCount={true}
  />
  <hr />
  </Fragment>
  ))}
  <S.BottomBox />
  </S.Layout>
  );
};