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
exports.UpdateIncomeUseCase = void 0;
const common_1 = require("@nestjs/common");
let UpdateIncomeUseCase = class UpdateIncomeUseCase {
    incomeRepository;
    incomeCategoryRepository;
    constructor(incomeRepository, incomeCategoryRepository) {
        this.incomeRepository = incomeRepository;
        this.incomeCategoryRepository = incomeCategoryRepository;
    }
    async execute(id, dto) {
        const income = await this.incomeRepository.findById(id);
        if (!income) {
            throw new common_1.NotFoundException('Income not found');
        }
        await this.validate(dto);
        const updated = await this.incomeRepository.update(id, {
            categoryId: dto.categoryId,
        });
        return updated;
    }
    async validate(dto) {
        if (dto.categoryId !== undefined) {
            const category = await this.incomeCategoryRepository.findById(dto.categoryId);
            if (!category) {
                throw new common_1.BadRequestException('Income category not found');
            }
        }
    }
};
exports.UpdateIncomeUseCase = UpdateIncomeUseCase;
exports.UpdateIncomeUseCase = UpdateIncomeUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('IncomeRepository')),
    __param(1, (0, common_1.Inject)('IncomeCategoryRepository')),
    __metadata("design:paramtypes", [Object, Object])
], UpdateIncomeUseCase);
//# sourceMappingURL=update-income.use-case.js.map