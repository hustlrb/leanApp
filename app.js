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
  // await test2();
  await test3();
}

async function test() {
  const Todo = AV.Object.extend('Todo');

  let firstId = null;

  try {
    const todoCount = await new AV.Query(Todo).count();
    console.log('todo count: ', todoCount);

    if (todoCount < 2) {
      let todo = new Todo();
      todo.set('title', '工程师周会');
      todo.set('content', '每周工程师会议，周一下午2点');

      const res = await todo.save();
      console.log('new todo created with objectId: ', res.id);
    }

    const firstTodo = await new AV.Query(Todo).first();
    firstId = firstTodo.id;
    console.log('first raw todo: ', firstTodo);

    const point = new AV.GeoPoint(39.9, 116.4);
    firstTodo.set('whereCreated', point);
    await firstTodo.save();

    const todoList = await new AV.Query('Todo').find(); // could be className string or the AV.Object subclass type
    console.log('todo list:');
    todoList.forEach((i) => {
      console.log(' - ', i.toJSON());
    });

    console.log('---------------------------------------------------------');

    const todoToFetch = AV.Object.createWithoutData('Todo', firstId); // className should be string type
    // const todoToFetch = new Todo();
    // todoToFetch.id = firstId;
    const todoFetched = await todoToFetch.fetch({
      keys: 'title,whereCreated'
    });
    console.log('todo fetched: ', todoFetched.toJSON());
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

async function test3() {
  // query the first item
  const queryFirstStr = 'select * from TodoFolder ' +
    'limit 1 ' +
    'order by createdAt ' +
    'desc';
  const firstFolder = await AV.Query.doCloudQuery(queryFirstStr);
  firstFolder.results.forEach((i) => {
    console.log(' - todo folder: ', i.toJSON());
  });

  const queryCountStr = 'select count(*) from TodoFolder';
  const count = await AV.Query.doCloudQuery(queryCountStr);
  console.log('count: ', count);
}
