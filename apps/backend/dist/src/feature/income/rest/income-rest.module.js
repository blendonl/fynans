"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncomeRestModule = void 0;
const common_1 = require("@nestjs/common");
const income_core_module_1 = require("../core/income-core.module");
const income_controller_1 = require("./controllers/income.controller");
let IncomeRestModule = class IncomeRestModule {
};
exports.IncomeRestModule = IncomeRestModule;
exports.IncomeRestModule = IncomeRestModule = __decorate([
    (0, common_1.Module)({
        imports: [income_core_module_1.IncomeCoreModule],
        controllers: [income_controller_1.IncomeController],
    })
], IncomeRestModule);
//# sourceMappingURL=income-rest.module.js.map