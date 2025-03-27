import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LessThan, MoreThan, Repository } from "typeorm";

import { Schedule } from "./schedule.entity";

@Injectable()
export class ScheduleService {
    constructor(
        @InjectRepository(Schedule)
        private readonly scheduleRepository: Repository<Schedule>
    ) { }

    private isValidDateFormat(dateStr: string): boolean {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;  // YYYY-MM-DD
        const dateTimeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/; // YYYY-MM-DD HH:mm
        const timeRegex = /^\d{2}:\d{2}$/; // HH:mm
    
        return dateRegex.test(dateStr) || dateTimeRegex.test(dateStr) || timeRegex.test(dateStr);
    }

    async getAllSchedule(): Promise<Schedule[]> {
        const list_schedule = await this.scheduleRepository.find();
        if (!list_schedule.length)
            return [];
        return list_schedule;
    }

    async getScheduleById(id: string): Promise<Schedule> {
        const schedule = await this.scheduleRepository.findOne({ where: { id } });
        if (!schedule) {
            throw new NotFoundException(`Schedule with ID ${id} not found`);
        }
        return schedule;
    }

    async getScheduleByConditions(startDate?: string, endDate?: string): Promise<Schedule[]> {
        const whereCondition: any = {};
        if (startDate) whereCondition.createDate = MoreThan(new Date(startDate));
        if (endDate) whereCondition.createDate = LessThan(new Date(endDate));

        const list = await this.scheduleRepository.find({ where: whereCondition });
        if (!list)
            throw new ConflictException("Error")

        return list;
    }


    async addSchedule(data: Schedule): Promise<Schedule> {
        let errors : string[] ;

        const validActione = ['On', 'Off'];
        if (!data.action || !validActione.includes(data.action)) {
            errors.push(`Invalid status. Allowed values: ${validActione.join(', ')}`);
        }

        if (!data.conditon) {
            errors.push('Condition is required.');
        }

        if (!data.time) {
            errors.push('Time is required.');
        }else if(!this.isValidDateFormat(data.time))
            errors.push('Time not correct format "YYYY-MM-DD", "YYYY-MM-DD HH:mm" or "HH:mm".');


        if (errors.length > 0) {
            throw new BadRequestException(errors);
        }

        const nowUTC = new Date();
        data.createDate = data.updateDate = new Date(nowUTC.getTime() + 7 * 60 * 60 * 1000);

        const newDevice = this.scheduleRepository.create(data);
        const savedDevice = await this.scheduleRepository.save(newDevice);

        return savedDevice;
    }

    async updateSchedule(id: string, data: Schedule): Promise<String> {
        const errors: string[] = [];
    
        if (!id) {
            errors.push('Shedule ID is required.');
        }

        const idChedule = await this.scheduleRepository.findOne({where:{id:id}})
        if (!idChedule) {
            throw new NotFoundException(`Shedule with ID ${id} not found`);
        }
    
        const validActione = ['On', 'Off'];
        if (data.action && !validActione.includes(data.action)) {
            errors.push(`Invalid status. Allowed values: ${validActione.join(', ')}`);
        }

        if(data.time && !this.isValidDateFormat(data.time))
            errors.push('Time not correct format "YYYY-MM-DD", "YYYY-MM-DD HH:mm" or "HH:mm".');
    
        if (errors.length > 0) {
            throw new BadRequestException(errors);
        }
    
        const nowUTC = new Date();
        data.updateDate = new Date(nowUTC.getTime() + 7 * 60 * 60 * 1000);
    
        const updateResult = await this.scheduleRepository.update({ id: id }, data);
        if (updateResult.affected === 0) {
            throw new BadRequestException(`Failed to update schedule with ID ${id}.`);
        }
        return 'Update successfully';
    }

    async deleteSchedule(id: string): Promise<String> {
        const resultFind = await this.scheduleRepository.findOne({
            where: { id: id },
        })

        if (!resultFind)
            throw new ConflictException(`The schedule with id ${id} isn't exist`)

        const deleteDevice = await this.scheduleRepository.delete({ id: id })
        if (deleteDevice.affected === 0) {
            throw new BadRequestException(`Failed to delete schedule with id ${id}.`);
        }

        return "Delete schedule successfully";
    }
}