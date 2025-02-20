import { ethers } from 'ethers'
import {
  AnchorStateRegistry__factory,
  FaultDisputeGame__factory,
  DisputeGameFactory__factory,
  MIPS__factory,
  OptimismPortal2__factory,
  SystemConfig__factory,
  type FaultDisputeGame as FaultDisputeGameContract,
  type DisputeGameFactory as DisputeGameFactoryContract,
  type MIPS as MipsContract,
  type OptimismPortal2 as PortalContract,
  type SystemConfig as SystemConfigContract,
  type AnchorStateRegistry as AnchorStateRegistryContract,
} from '@types/contracts'

export class ContractsFactory {
  private systemConfigContract: SystemConfigContract
  private disputeGameFactoryContract: DisputeGameFactoryContract | null = null
  private optimismPortalContract: PortalContract | null = null

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

  async getPortalContract(): Promise<PortalContract> {
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

  getAnchorStateRegistryContract(address: string): AnchorStateRegistryContract {
    return AnchorStateRegistry__factory.connect(address, this.provider)
  }

  getMipsContract(address: string): MipsContract {
    return MIPS__factory.connect(address, this.provider)
  }
}

export type {
  FaultDisputeGameContract,
  DisputeGameFactoryContract,
  PortalContract,
  SystemConfigContract,
  AnchorStateRegistryContract,
  MipsContract,
}
