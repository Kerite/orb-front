"use client";
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Input, Select, SelectItem } from "@heroui/react";
import { AccsDefaultParams } from "@lit-protocol/types";
import { properties } from "@lit-protocol/accs-schemas/schemas/LPACC_EVM_BASIC"
import styled from "styled-components";
import { Dispatch } from "react";
import { AvailableChains, DEFAULT_CONDITION } from "@/lib/constants";
import { ethers } from "ethers";

const Container = styled.div`
  border: 1px solid #ddd;
  border-radius: 3px;
  padding: 10px;
  margin: 8px 0;
  background-color: #fff;
  display: flex;
  flex-direction: column;
`

const CONDITION_PRESETS: Readonly<{ key: string, title: string, condition: AccsDefaultParams }[]> = [
  {
    key: "balance",
    title: "ETH Balance",
    condition: {
      ...DEFAULT_CONDITION,
    }
  },
  {
    key: "erc20",
    title: "ERC20 Balance (eg. USDT)",
    condition: {
      ...DEFAULT_CONDITION,
      standardContractType: 'ERC20',
      method: 'balanceOf',
    }
  },
  {
    key: "erc721",
    title: "ERC721",
    condition: {
      ...DEFAULT_CONDITION,
      standardContractType: 'ERC721',
      method: 'balanceOf',
      parameters: [
        ':userAddress'
      ],
      returnValueTest: {
        comparator: '>',
        value: '0',
      }
    }
  },
  {
    key: "erc1155",
    title: "ERC1155",
    condition: {
      ...DEFAULT_CONDITION,
      standardContractType: 'ERC1155',
      method: 'balanceOf',
      parameters: [
        ':userAddress',
        '',
      ],
      returnValueTest: {
        comparator: '>',
        value: '0'
      }
    }
  }
]

const ChainSelect = ({ condition, updateCondition }: {
  condition: Readonly<AccsDefaultParams>,
  updateCondition: Dispatch<Readonly<AccsDefaultParams>>
}) => {
  return (
    <Select label="Chain" defaultSelectedKeys={[condition.chain]} onChange={(e) => {
      updateCondition({ ...condition, chain: e.target.value as AccsDefaultParams["chain"] });
    }}>
      {AvailableChains.map(chain => (
        <SelectItem key={chain} textValue={chain}>{chain}</SelectItem>
      ))}
    </Select>
  )
}


export default function NormalCondition({ condition, updateCondition }: {
  condition: Readonly<AccsDefaultParams>,
  updateCondition: Dispatch<Readonly<AccsDefaultParams>>
}) {
  return (
    <Container className="gap-2">
      <Dropdown>
        <DropdownTrigger>
          <Button>
            Use template
          </Button>
        </DropdownTrigger>
        <DropdownMenu items={CONDITION_PRESETS}>
          {(preset) => (
            <DropdownItem key={preset.key} onPress={() => updateCondition(preset.condition)}>
              {preset.title}
            </DropdownItem >
          )}
        </DropdownMenu>
      </Dropdown>
      <ChainSelect condition={condition} updateCondition={updateCondition} />
      {condition.method === "eth_getBalance" ? (
        <>
          <Input value={ethers.utils.formatEther(condition.returnValueTest.value)} onValueChange={(newValue => {
            updateCondition({
              ...condition,
              returnValueTest: {
                ...condition.returnValueTest,
                value: `${ethers.utils.parseUnits(newValue, "ether")}`
              }
            })
          })} label="Minimum balance" />
        </>
      ) : condition.standardContractType === "ERC20" ? (
        <>
          <Input required value={condition.contractAddress} onValueChange={(newValue) => {
            updateCondition({ ...condition, contractAddress: newValue });
          }} label="ERC20 Token address" />
          <Input type="number" value={condition.returnValueTest.value} onValueChange={(newValue) => {
            updateCondition({
              ...condition,
              returnValueTest: {
                ...condition.returnValueTest,
                value: newValue
              }
            })
          }} label="Minimum ERC20 Token amount (Please add DECIMAL number of 0)" />
        </>
      ) : condition.standardContractType === "ERC721" ? (
        <>
          <Input value={condition.contractAddress} onValueChange={(newValue) => {
            updateCondition({ ...condition, contractAddress: newValue });
          }} label="ERC721 Token address" />
        </>
      ) : condition.standardContractType === "ERC1155" ? (
        <>
          <Input value={condition.contractAddress} onValueChange={(newValue) => {
            updateCondition({ ...condition, contractAddress: newValue });
          }} label="ERC1155 Token address" />
          <Input value={condition.parameters[1]} onValueChange={(newValue) => {
            updateCondition({
              ...condition,
              parameters: [condition.parameters[0], newValue]
            });
          }
          } label="Token ID" />
        </>
      ) : (
        <>
          <Select label="Contract Type" onChange={(e) => {
            updateCondition({ ...condition, standardContractType: e.target.value as AccsDefaultParams["standardContractType"] });
          }} defaultSelectedKeys={[condition.standardContractType]} isVirtualized>
            {properties.standardContractType.enum.map(type => (
              <SelectItem key={type} textValue={type}>{type}</SelectItem>
            ))}
          </Select>
          <Input
            label="Contract Address "
            placeholder='(eg.Your ERC20 address, 0xabcd...)'
            value={condition.contractAddress}
            onValueChange={(newValue) => {
              updateCondition({ ...condition, contractAddress: newValue });
            }}
          />
          <Input
            label="Methods"
            value={condition.method}
            onValueChange={(newValue) => {
              updateCondition({ ...condition, method: newValue });
            }}
          />
          <Input
            label="Value Compare"
            value={condition.returnValueTest.value} onValueChange={(newValue) => updateCondition({
              ...condition,
              returnValueTest: {
                ...condition.returnValueTest,
                value: newValue
              }
            })}
            startContent={
              <div className='flex items-center'>
                <select
                  className='outline-none border-0 bg-transparent text-small'
                  value={condition.returnValueTest.comparator}
                  onChange={(e) => {
                    updateCondition({
                      ...condition,
                      returnValueTest: {
                        ...condition.returnValueTest,
                        comparator: e.target.value as AccsDefaultParams["returnValueTest"]["comparator"]
                      }
                    });
                  }}
                >
                  <option value="=">=</option>
                  <option value=">">&gt;</option>
                  <option value="<">&lt;</option>
                  <option value=">=">&gt;=</option>
                  <option value="<=">&lt;=</option>
                </select>
              </div>
            } />
        </>
      )}
    </Container>
  )
}
