import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ServicesService } from './services.service';
import { Service } from './entities/service.entity';

describe('ServicesService', () => {
  let service: ServicesService;
  let repo: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    findAndCount: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    repo = {
      findOne: jest.fn(),
      create: jest.fn((dto: Record<string, unknown>) => dto),
      save: jest.fn((entity: Record<string, unknown>) =>
        Promise.resolve({ id: 'service-1', ...entity }),
      ),
      findAndCount: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicesService,
        { provide: getRepositoryToken(Service), useValue: repo },
      ],
    }).compile();

    service = module.get<ServicesService>(ServicesService);
  });

  it('creates a service', async () => {
    const dto = { title: 'Massage', duration: 60, price: 50 };
    const result = await service.create(dto /*as never*/);
    expect(result.id).toBe('service-1');
    expect(repo.save).toHaveBeenCalled();
  });

  it('throws NotFoundException when the service does not exist', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findOne('missing-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('lists services with pagination metadata', async () => {
    repo.findAndCount.mockResolvedValue([[{ id: '1' }], 1]);
    const result = await service.findAll({ page: 1, limit: 10 });
    expect(result.meta.total).toBe(1);
    expect(result.data).toHaveLength(1);
  });

  it('updates a service', async () => {
    repo.findOne.mockResolvedValue({ id: 'service-1', title: 'Old title' });
    const result = await service.update('service-1', { title: 'New title' });
    expect(result.title).toBe('New title');
  });

  it('removes a service', async () => {
    const existing = { id: 'service-1', title: 'Massage' };
    repo.findOne.mockResolvedValue(existing);
    await service.remove('service-1');
    expect(repo.remove).toHaveBeenCalledWith(existing);
  });
});
