// OpenAPI 명세를 기반으로 TypeScript 클라이언트를 생성하는 스크립트

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const SPEC_URL = 'https://api.example.com/openapi.yaml';
const OUTPUT_DIR = './generated-client';

async function main() {
  try {
    createOutputDirectory(OUTPUT_DIR);
    await fetchOpenAPISpec(SPEC_URL);
    await generateClientCode('openapi.yaml', OUTPUT_DIR);
    copyCustomConfig('./custom-config.ts', `${OUTPUT_DIR}/config.ts`);
    cleanUpFiles(['openapi.yaml']);
    console.log('TypeScript client generated successfully.');
  } catch (error) {
    console.error('Error:', error);
  }
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
        resolve();
      }
    });
  });
}

function generateClientCode(specFile, outputDir) {
  return new Promise((resolve, reject) => {
    exec(
      `openapi-generator-cli generate -i ${specFile} -g typescript-axios -o ${outputDir}`,
      (error) => {
        if (error) {
          reject(`Error generating client code: ${error.message}`);
        } else {
          resolve();
        }
      }
    );
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
