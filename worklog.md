---

Task ID: 1
Agent: Super Z (main)
Task: 搞巨严格的代码质量检测工具和测试

Work Log:

- 安装依赖：prettier, eslint-config-prettier, jest, @testing-library/\*, ts-jest, husky, lint-staged 到三个项目
- TypeScript 严格化：noImplicitAny, noUncheckedIndexedAccess, noUnusedLocals/Params, forceConsistentCasing
- 关闭 ignoreBuildErrors, 开启 reactStrictMode
- ESLint 严格规则：no-explicit-any, strict-boolean-expressions, no-shadow, naming-convention, curly, eqeqeq, complexity, max-depth, max-lines-per-function, prefer-template 等 40+ 条规则
- Prettier 统一格式化配置（三个项目）
- Husky + lint-staged 提交前自动检查
- Jest 测试框架：fishai-ai 49 个测试，fishai-server 9 个测试，fishai-web 8 个测试
- GitHub Actions CI 自动化流水线（typecheck + lint + format + test + build）
- 修复 strict TS 发现的真实 bug：memory.ts payload undefined, system-prompt || → ??, thinking-parser 复杂度/嵌套三元/curly
- 推送三个项目到 GitHub

Stage Summary:

- 三个项目全部配置完毕并推送到 GitHub
- fishai-ai: ESLint 0 errors 0 warnings + 49 tests PASS
- fishai-server: 9 tests PASS
- fishai-web: 8 tests PASS
- 现有源码（chat/page.tsx 等）有大量 lint error，需要逐步修复
