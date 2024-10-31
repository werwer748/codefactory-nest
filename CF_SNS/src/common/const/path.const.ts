import { join } from 'path';

// 서버 프로젝트의 루트 폴더 - 절대경로
export const PROJECT_ROOT_PATH = process.cwd();
// 외부에서 접근 가능한 파일들을 모아둔 폴더 이름
export const PUBLIC_FOLDER_NAME = 'public';
// 퍼블릭 폴더 안에서 게시글 이미지를 저장할 폴더 이름
export const POST_FOLDER_NAME = 'posts';
// 임시 폴더 이름
export const TEMP_FOLDER_NAME = 'temp';

// 실제 공개폴더의 절대 경로
// /{프로젝트 위치}/public
export const PUBLIC_FOLDER_PATH =
  //? join => ,로 구분된 스트링들을 주면 /로 구분된 경로를 만들어 준다.
  join(PROJECT_ROOT_PATH, PUBLIC_FOLDER_NAME);

// 포스트 이미지를 저장할 폴더
// /{프로젝트 위치}/public/posts
export const POST_IMAGE_PATH = join(
  PUBLIC_FOLDER_PATH,
  POST_FOLDER_NAME,
);

// 절대 경로가 아닌 public폴더를 기준으로 하는 포스트폴더 경로 - 프론트 전송용
// /public/posts
export const POST_PUBLIC_IMAGE_PATH = join(
  PUBLIC_FOLDER_NAME,
  POST_FOLDER_NAME
);

// 임시파일 저장할 폴더
export const TEMP_FOLDER_PATH = join(
  PUBLIC_FOLDER_PATH,
  TEMP_FOLDER_NAME
);


