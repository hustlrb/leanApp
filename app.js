// hustlrb AT gmail.com

import AV from 'leancloud-storage';

const LC_APP_ID = 'QApBtOkMNfNo0lGaHxKBSWXX-gzGzoHsz';
const LC_APP_KEY = 'znR6wk5JzFU0XIkgKxrM3fnH';

const PHONE = '18684700942';
const PASSWORD = '123456';

(async function entry() {
  AV.init({
    appId: LC_APP_ID,
    appKey: LC_APP_KEY
  });

  try {
    await AV.User.logInWithMobilePhone(PHONE, PASSWORD);

    await main();
  } catch (e) {
    console.log('[ERROR] ---> ', e);
  }
})();

async function main() {
  await test();
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
    console.log('first todo: ', todo_1th);

    const todo_all = await new AV.Query(Todo).find();
    console.log('all todos: ', todo_all);
  } catch (e) {
    throw e;
  }
}
