import { EntityId } from 'typeorm/repository/EntityId'
import { DeleteResult, PrimaryGeneratedColumn, Repository } from 'typeorm'
import { BadRequestException, Logger, NotFoundException } from '@nestjs/common'

export class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
}

interface IBaseService<T> {
  findAll(): Promise<T[]>

  findById(id: EntityId): Promise<T>

  delete(id: EntityId): Promise<DeleteResult>
}



export class BaseService<T extends BaseEntity, R extends Repository<T>> implements IBaseService<T> {
  protected readonly repository: R
  protected readonly logger: Logger

  constructor(repository: R, logger: Logger) {
    this.repository = repository
    this.logger = logger
  }

  getNowVnDate(): Date {
    return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
  }

  async findAll(): Promise<T[]> {
    const list = await this.repository.find();
    if (!list.length)
      return [];
    return list;
  }

  async findById(id: string, relation = []): Promise<T> {
    const temp = await this.repository.findOne({
      where: {
        id: id as any,
      },
      relations: relation
    })
    if (!temp) {
      throw new NotFoundException(`Items with ID ${id} not found`);
    }
    return temp
  }

  async delete(id: EntityId): Promise<DeleteResult> {
    const deleteDevice = await this.repository.delete(id)
    if (deleteDevice.affected === 0) {
      throw new BadRequestException(`Failed to delete device with id ${id}.`);
    }
    return deleteDevice
  }
}
