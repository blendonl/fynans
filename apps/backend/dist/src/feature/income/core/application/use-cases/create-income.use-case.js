"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateIncomeUseCase = void 0;
const common_1 = require("@nestjs/common");
let CreateIncomeUseCase = class CreateIncomeUseCase {
    incomeRepository;
    incomeCategoryRepository;
    constructor(incomeRepository, incomeCategoryRepository) {
        this.incomeRepository = incomeRepository;
        this.incomeCategoryRepository = incomeCategoryRepository;
    }
    async execute(dto) {
        await this.validate(dto);
        const income = await this.incomeRepository.create({
            transactionId: dto.transactionId,
            storeId: dto.storeId,
            categoryId: dto.categoryId,
        });
        return income;
    }
    async validate(dto) {
        if (!dto.transactionId || dto.transactionId.trim() === '') {
            throw new common_1.BadRequestException('Transaction ID is required');
        }
        if (!dto.storeId || dto.storeId.trim() === '') {
            throw new common_1.BadRequestException('Store ID is required');
        }
        if (!dto.categoryId || dto.categoryId.trim() === '') {
            throw new common_1.BadRequestException('Category ID is required');
        }
        const category = await this.incomeCategoryRepository.findById(dto.categoryId);
        if (!category) {
            throw new common_1.NotFoundException('Income category not found');
        }
        const existingIncome = await this.incomeRepository.findByTransactionId(dto.transactionId);
        if (existingIncome) {
            throw new common_1.ConflictException('Income already exists for this transaction');
        }
    }
};
exports.CreateIncomeUseCase = CreateIncomeUseCase;
exports.CreateIncomeUseCase = CreateIncomeUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('IncomeRepository')),
    __param(1, (0, common_1.Inject)('IncomeCategoryRepository')),
    __metadata("design:paramtypes", [Object, Object])
], CreateIncomeUseCase);
//# sourceMappingURL=create-income.use-case.js.map