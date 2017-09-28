// hustlrb AT gmail.com

import AV from 'leancloud-storage';

const LC_APP_ID = 'QApBtOkMNfNo0lGaHxKBSWXX-gzGzoHsz';
const LC_APP_KEY = 'znR6wk5JzFU0XIkgKxrM3fnH';

const PHONE = '18684700942';
const PASSWORD = '123456';

class Todo extends AV.Object {}
class TodoFolder extends AV.Object {}

(async function entry() {
  AV.init({
    appId: LC_APP_ID,
    appKey: LC_APP_KEY
  });

  AV.Object.register(Todo);
  AV.Object.register(TodoFolder);

  try {
    await AV.User.logInWithMobilePhone(PHONE, PASSWORD);

    await main();
  } catch (e) {
    console.log('[ERROR] ---> ', e);
  }
})();

async function main() {
  // await test();
  await test2();
}

async function test() {
  const Todo = AV.Object.extend('Todo');

  try {
    const todo_count = await new AV.Query(Todo).count();
    console.log('todo count: ', todo_count);

    if (todo_count < 5) {
      let todo = new Todo();
      todo.set('title', '工程师周会');
      todo.set('content', '每周工程师会议，周一下午2点');

      const res = await todo.save();
      console.log('new todo created with objectId: ' + res.id);
    }

    const todo_1th = await new AV.Query(Todo).first();
    console.log('first todo raw: ', todo_1th);
    console.log('first todo: ', todo_1th.toJSON());

    const todo_all = await new AV.Query(Todo).find();
    console.log('all todos:');
    todo_all.forEach((i) => {
      console.log(' - todo: ', i.toJSON());
    });
  } catch (e) {
    throw e;
  }
}

async function test2() {
  const folderWork = new TodoFolder({
    name: '工作',
  });

  const folderLife = new TodoFolder({
    name: '生活',
  });

  const folderTravel = new TodoFolder({
    name: '旅行',
  });

  await AV.Object.saveAll([folderWork, folderLife, folderTravel]);

  const todoAntd = new Todo({
    title: 'react',
    content: 'antd 组件学习',
    folder: folderWork,
  });

  const todoTibet = new Todo({
    title: '西藏自驾游',
    content: '利用辞职等的机会进行 30 天自驾游',
    folder: folderTravel,
  });

  await AV.Object.saveAll([
    todoAntd,
    todoTibet,
  ]);

  console.log('[DEBUG] ---> data population finished');

  const ascQ = new AV.Query('TodoFolder');
  ascQ.descending('createdAt');

  const firstQ = new AV.Query('TodoFolder');
  firstQ.ascending('createdAt');
  let firstFolder = await firstQ.first();
  console.log('first todo folder: ', firstFolder.toJSON());

  let nextQ = new AV.Query('TodoFolder');
  let lastCreatedAt = firstFolder.createdAt;

  let todoFolders = [];
  do {
    nextQ.greaterThan('createdAt', lastCreatedAt);
    nextQ.ascending('createdAt');
    nextQ.limit(25);
    console.log(nextQ.toJSON());

    todoFolders = await AV.Query.and(nextQ).find();

    todoFolders.forEach((i) => {
      console.log(' - todo folder: ', i.toJSON());
    });

    if (todoFolders.length > 0)
      lastCreatedAt = todoFolders[todoFolders.length - 1].createdAt;
  } while (todoFolders.length > 0);
}
