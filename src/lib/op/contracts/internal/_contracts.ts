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
import type { Providers } from '@lib/op/_providers'

export class ContractsFactory {
  private systemConfigContract: SystemConfigContract
  private disputeGameFactoryContract: DisputeGameFactoryContract | null = null
  private optimismPortalContract: PortalContract | null = null

  constructor(
    private readonly providers: Providers,
    systemConfigAddress: string
  ) {
    this.systemConfigContract = SystemConfig__factory.connect(systemConfigAddress, this.providers.l1)
  }

  async getDisputeGameFactoryContract(): Promise<DisputeGameFactoryContract> {
    if (!this.disputeGameFactoryContract) {
      const address = await this.systemConfigContract.disputeGameFactory()
      this.disputeGameFactoryContract = DisputeGameFactory__factory.connect(
        address,
        this.providers.l1
      )
    }
    return this.disputeGameFactoryContract
  }

  async getPortalContract(): Promise<PortalContract> {
    if (!this.optimismPortalContract) {
      const address = await this.systemConfigContract.optimismPortal()
      this.optimismPortalContract = OptimismPortal2__factory.connect(
        address,
        this.providers.l1
      )
    }
    return this.optimismPortalContract
  }

  getSystemConfigContract(): SystemConfigContract {
    return this.systemConfigContract
  }

  getFaultDisputeGameContract(address: string): FaultDisputeGameContract {
    return FaultDisputeGame__factory.connect(address, this.providers.l1)
  }

  getAnchorStateRegistryContract(address: string): AnchorStateRegistryContract {
    return AnchorStateRegistry__factory.connect(address, this.providers.l1)
  }

  getMipsContract(address: string): MipsContract {
    return MIPS__factory.connect(address, this.providers.l1)
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
