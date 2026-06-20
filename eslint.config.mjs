import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import prettierConfig from "eslint-config-prettier";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  prettierConfig,
  {
    // 需要类型信息的规则必须配置 project
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      // === TypeScript 严格规则 ===
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-unused-expressions": "error",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-shadow": "error",
      "@typescript-eslint/no-inferrable-types": "error",
      "@typescript-eslint/default-param-last": "error",
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "variable",
          format: ["camelCase", "UPPER_CASE", "PascalCase"],
          leadingUnderscore: "allow",
          trailingUnderscore: "forbid",
        },
        {
          selector: "function",
          format: ["camelCase", "PascalCase"],
        },
        {
          selector: "typeLike",
          format: ["PascalCase"],
        },
        {
          selector: "enumMember",
          format: ["UPPER_CASE"],
        },
      ],

      // === React 严格规则 ===
      "react-hooks/exhaustive-deps": "error",
      "react-hooks/rules-of-hooks": "error",
      "react/no-unescaped-entities": "error",
      "react/display-name": "error",
      "react/prop-types": "off",
      "react/no-array-index-key": "warn",
      "react/no-danger": "error",
      "react/jsx-no-useless-fragment": "error",
      "react/jsx-key": "error",
      "react/jsx-curly-brace-presence": [
        "error",
        { props: "never", children: "never", propElementValues: "always" },
      ],

      // === JavaScript 核心严格规则 ===
      "prefer-const": "error",
      "no-var": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "error",
      "no-empty": "error",
      "no-irregular-whitespace": "error",
      "no-case-declarations": "error",
      "no-fallthrough": "error",
      "no-mixed-spaces-and-tabs": "error",
      "no-redeclare": "error",
      "no-unreachable": "error",
      "no-useless-escape": "error",
      "no-duplicate-imports": "error",
      "no-throw-literal": "error",
      "no-return-await": "error",
      "eqeqeq": ["error", "always"],
      "curly": ["error", "all"],
      "no-else-return": "error",
      "no-nested-ternary": "error",
      "prefer-template": "error",
      "prefer-arrow-callback": "error",
      "prefer-destructuring": ["error", { array: true, object: true }],
      "prefer-spread": "error",
      "prefer-object-spread": "error",
      "no-param-reassign": "error",
      "complexity": ["warn", { max: 15 }],
      "max-depth": ["warn", { max: 4 }],
      "max-lines-per-function": ["warn", { max: 80, skipBlankLines: true, skipComments: true }],
    },
  },
  // Test files override
  {
    files: ["src/**/*.test.{ts,tsx}"],
    rules: {
      "max-lines-per-function": "off",
      "max-depth": "off",
      "complexity": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "examples/**",
      "skills/**",
      "dist/**",
      "coverage/**",
      "src/components/ui/**",
      "src/lib/markdown.tsx",
      "src/__mocks__/**",
    ],
  },
];

export default eslintConfig;
