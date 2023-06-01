/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */

import { ethers } from 'hardhat';
import { request, gql } from 'graphql-request'
import { CONFIG } from '../config';
import { createFile, fileExists } from './lib/aws_utils'

interface AddressInfo {
  address: string;
  balance: string;
}

async function queryAccountsAndBalances (subql: string, block: number) {
  const query = async (start: number, pageSize = 999) => {
    const querySchema = gql`
    query {
      accounts (first: ${pageSize}, offset: ${start}, blockHeight: "${block}") {
        nodes {
          id
          balance
        }
        pageInfo {
          hasNextPage 
        }
      }
    }
    `
    const result = await request(subql, querySchema);

    return {
      hasNextPage: result.accounts.pageInfo.hasNextPage,
      addressInfo: result.accounts.nodes.map((node: any) => {
        return {
          address: node.id,
          balance: node.balance
        }
      }).flat()
    }
  };
  const pageSize = 99;
  let start = 0;
  let flag = true;
  let addressInfo: AddressInfo[] = [];

  while(flag) {
    const result = await query(start, pageSize);

    addressInfo = [...addressInfo, ...result.addressInfo];
    flag = result.hasNextPage;
    start += pageSize;
  }

  return addressInfo;
}

export const getTapEthBalance = async (block: number) => {
  const network = await ethers.provider.getNetwork();

  console.log('\n----------------------------------------------');
  console.log(`* Query tapETH Balance on ${network.name} *`);
  console.log('----------------------------------------------\n');

  const balanceFile = `balances/${network.name}_tapeth_${block}.csv`;
  if (await fileExists(balanceFile)) {
    console.log(`${balanceFile} exists. Skip querying raw balances.`);
    return;
  }

  const start = new Date();
  let content = 'Address,Balance\n';

  console.log(`Start querying tapETH balance on at ${start.toTimeString()}`);

  const subql = CONFIG[network.name].subql;
  const addressInfo = await queryAccountsAndBalances(subql, block);
  for (let info of addressInfo) {
    content += info.address + "," + info.balance + "\n";
  }

  await createFile(balanceFile, content);

  const end = new Date();
  console.log(`End querying tapETH balance at ${end.toTimeString()}`);
  console.log(`tapETH account number: ${addressInfo.length}, duration: ${(end.getTime() - start.getTime()) / 1000}s`);
}
