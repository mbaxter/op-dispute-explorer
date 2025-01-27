import { ethers } from 'ethers'
import {
  FaultDisputeGame__factory,
  DisputeGameFactory__factory,
  OptimismPortal2__factory,
  SystemConfig__factory,
} from '../types/contracts'

export const getDisputeGameFactory = (provider: ethers.Provider, address: string) => {
  return DisputeGameFactory__factory.connect(address, provider)
}

export const getFaultDisputeGame = (provider: ethers.Provider, address: string) => {
  return FaultDisputeGame__factory.connect(address, provider)
}

export const getOptimismPortal = (provider: ethers.Provider, address: string) => {
  return OptimismPortal2__factory.connect(address, provider)
}

export const getSystemConfig = (provider: ethers.Provider, address: string) => {
  return SystemConfig__factory.connect(address, provider)
}

// Export the factories directly as well in case they're needed
export {
  FaultDisputeGame__factory,
  DisputeGameFactory__factory,
  OptimismPortal2__factory,
  SystemConfig__factory,
} 
