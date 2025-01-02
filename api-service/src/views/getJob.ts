import { NodeLogger } from '@unconventional-code/observability-sdk';
import { Job } from '@unconventional-jackson/avoca-external-api';
import { ErrorResponse } from '@unconventional-jackson/avoca-internal-api';
import { Request, Response } from 'express';

import { JobModel } from '../models/models/Jobs';

type GetJobParams = {
  job_id: string;
};

export async function getJobView(
  req: Request<GetJobParams>,
  res: Response<Job | ErrorResponse>
) {
  const log = new NodeLogger({
    correlation: res.locals.correlation,
    name: 'views/getJob',
  });

  try {
    const jobModel = await JobModel.findByPk(req.params.job_id);

    if (!jobModel) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    res.status(200).json(jobModel.toJSON());
  } catch (error) {
    log.error(error);
    res.status(500).json({ error: String(error) });
  }
}
