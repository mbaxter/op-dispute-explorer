import { ethers } from 'ethers'
import {
  FaultDisputeGame__factory,
  DisputeGameFactory__factory,
  OptimismPortal2__factory,
  SystemConfig__factory,
  type FaultDisputeGame as FaultDisputeGameContract,
  type DisputeGameFactory as DisputeGameFactoryContract,
  type OptimismPortal2 as OptimismPortal2Contract,
  type SystemConfig as SystemConfigContract,
} from '@types/contracts'

export class ContractsFactory {
  private systemConfigContract: SystemConfigContract
  private disputeGameFactoryContract: DisputeGameFactoryContract | null = null
  private optimismPortalContract: OptimismPortal2Contract | null = null

  constructor(
    private readonly provider: ethers.Provider,
    systemConfigAddress: string
  ) {
    this.systemConfigContract = SystemConfig__factory.connect(systemConfigAddress, provider)
  }

  async getDisputeGameFactoryContract(): Promise<DisputeGameFactoryContract> {
    if (!this.disputeGameFactoryContract) {
      const address = await this.systemConfigContract.disputeGameFactory()
      this.disputeGameFactoryContract = DisputeGameFactory__factory.connect(
        address,
        this.provider
      )
    }
    return this.disputeGameFactoryContract
  }

  async getOptimismPortalContract(): Promise<OptimismPortal2Contract> {
    if (!this.optimismPortalContract) {
      const address = await this.systemConfigContract.optimismPortal()
      this.optimismPortalContract = OptimismPortal2__factory.connect(
        address,
        this.provider
      )
    }
    return this.optimismPortalContract
  }

  getSystemConfigContract(): SystemConfigContract {
    return this.systemConfigContract
  }

  getFaultDisputeGameContract(address: string): FaultDisputeGameContract {
    return FaultDisputeGame__factory.connect(address, this.provider)
  }
}

export type {
  FaultDisputeGameContract,
  DisputeGameFactoryContract,
  OptimismPortal2Contract,
  SystemConfigContract,
}
