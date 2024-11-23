// OpenAPI 명세를 기반으로 TypeScript 클라이언트를 생성하고 MSW 모킹 핸들러를 생성하는 스크립트

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const msw = require('msw-auto-mock');

const SPEC_URL = 'https://api.example.com/openapi.yaml';
const OUTPUT_DIR = './generated-client';

function main() {
  createOutputDirectory(OUTPUT_DIR);
  fetchOpenAPISpec(SPEC_URL)
    .then((specData) => {
      return Promise.all([
        generateClientCode(specData, OUTPUT_DIR),
        generateMswMocks(specData, './msw-mocks'),
      ]);
    })
    .then(() => {
      copyCustomConfig('./custom-config.ts', `${OUTPUT_DIR}/config.ts`);
      cleanUpFiles(['openapi.yaml']);
      console.log('TypeScript client and MSW mocks generated successfully.');
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

function createOutputDirectory(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
}

function fetchOpenAPISpec(url) {
  return new Promise((resolve, reject) => {
    exec(`curl -o openapi.yaml ${url}`, (error) => {
      if (error) {
        reject(`Error fetching OpenAPI spec: ${error.message}`);
      } else {
        const specData = fs.readFileSync('openapi.yaml', 'utf8');
        resolve(specData);
      }
    });
  });
}

function generateClientCode(specData, outputDir) {
  return new Promise((resolve, reject) => {
    fs.writeFileSync('temp-spec.yaml', specData);
    exec(
      `openapi-generator-cli generate -i temp-spec.yaml -g typescript-axios -o ${outputDir}`,
      (error) => {
        if (error) {
          reject(`Error generating client code: ${error.message}`);
        } else {
          fs.unlinkSync('temp-spec.yaml');
          resolve();
        }
      }
    );
  });
}

function generateMswMocks(specData, outputDir) {
  return new Promise((resolve, reject) => {
    const mocks = msw.parse(specData); // msw-auto-mock의 가상의 함수 사용
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    fs.writeFile(path.join(outputDir, 'handlers.js'), mocks, (error) => {
      if (error) {
        reject(`Error writing MSW mocks: ${error.message}`);
      } else {
        resolve();
      }
    });
  });
}

function copyCustomConfig(src, dest) {
  fs.copyFileSync(src, dest);
}

function cleanUpFiles(files) {
  files.forEach((file) => {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
  });
}

main();
