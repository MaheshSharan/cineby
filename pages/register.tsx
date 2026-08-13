import type { GetServerSideProps } from "next";

import Home, { getServerSideProps as getHomeServerSideProps } from "./index";

export const getServerSideProps: GetServerSideProps = getHomeServerSideProps;

export default Home;