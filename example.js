// OpenAPI 명세를 기반으로 TypeScript 클라이언트를 생성하는 스크립트

const { exec } = require('child_process');
const fs = require('fs');

function main() {
  let specUrl = 'https://api.example.com/openapi.yaml';
  let outputDir = './generated-client';

  // 폴더를 만드는 로직
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  // OpenAPI 명세를 가져오는 로직
  exec(`curl -o openapi.yaml ${specUrl}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error fetching OpenAPI spec: ${error}`);
      return;
    }

    // 클라이언트 코드 생성하는 로직
    exec(
      `openapi-generator-cli generate -i openapi.yaml -g typescript-axios -o ${outputDir}`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Error generating client code: ${error}`);
          return;
        }

        // 파일 입력 처리를 하는 로직
        fs.copyFileSync('./custom-config.ts', `${outputDir}/config.ts`);

        // 더는 필요 없는 파일을 삭제하는 로직
        fs.unlinkSync('openapi.yaml');

        // 기타 방어 처리들이 혼합되어 있음
        console.log('TypeScript client generated successfully.');
      }
    );
  });

  // 에러 처리가 부족하고 코드가 중첩되어 있음
}

main();
