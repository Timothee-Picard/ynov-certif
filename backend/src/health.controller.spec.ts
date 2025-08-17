import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';

describe('HealthController', () => {
	let controller: HealthController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [HealthController],
		}).compile();

		controller = module.get<HealthController>(HealthController);
	});

	it('doit être défini', () => {
		expect(controller).toBeDefined();
	});

	it('checkHealth() retourne "Service is healthy"', () => {
		expect(controller.checkHealth()).toBe('Service is healthy');
	});
});
