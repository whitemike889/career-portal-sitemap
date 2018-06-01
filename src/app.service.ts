import { Injectable } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { JobOrder } from '@bullhorn/bullhorn-types';

const publicRestEndpoint: string = process.env.BULLHORN_PUBLIC_ENDPOINT;

@Injectable()
export class AppService {
  root(): string {
    return 'Hello World!';
  }

  async getJobs(): Promise<{data: JobOrder[]}> {
    return axios.get(`${publicRestEndpoint}/search/JobOrder?fields=id,title,startDate,address(city,state),employmentType,dateLastPublished&query=isDeleted:0&sort=-dateLastPublished&count=20`)
      .then((res: AxiosResponse) => res.data);
  }

  async getJob(id: number): Promise<JobOrder> {
    return axios.get(`${publicRestEndpoint}/search/JobOrder?fields=*&query=id:${id}`)
      .then((res: AxiosResponse) => res.data)
      .then((result: any) => {
        const job = result.data[0];
        return job;
      });
    }
}
