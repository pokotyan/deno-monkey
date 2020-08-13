import * as obj from "./index.ts";

export class Environment {
  store: {
    [k: string]: obj.Object;
  };
  outer: Environment | null;

  constructor() {
    this.store = {};
    this.outer = null;
  }

  // 内側のスコープ（現在のスコープ）で見つからないなら外側のスコープで探す。それを再帰的に行う。
  // 一番外側のスコープまでいった時はそれはルートスコープ（NewEnvironmentで作った環境）
  // （envをスコープごとに区切ることで、クロージャを実現することができる）
  Get(name: string): [obj.Object, boolean] {
    let ok = this.store.hasOwnProperty(name);
    let obj = this.store[name];

    if (!ok && this.outer) {
      [obj, ok] = this.outer.Get(name);
    }

    return [obj, ok];
  }

  Set(name: string, val: obj.Object) {
    this.store[name] = val;
    return val;
  }
}

export const NewEnvironment = () => {
  return new Environment();
};

// スコープがネストするタイミングで呼ばれる関数。関数のbodyを評価するタイミングで利用される。
// 関数のbodyをそのまま現在の環境で評価するわけにはいけないので、body用の新たな環境を用意するための関数。
// 現在のenvで、新しいenvを囲い込む。現在のenvが外側のスコープとなるイメージ。（そして、内側の新しいenvが現在のenv扱いになる）
// 現在のenvは引数で渡されているouter。
// つまりスコープがネストするごとに内側にenvがネストされていくイメージ。
export const NewEnclosedEnvironment = (outer: Environment) => {
  const env = new Environment();
  env.outer = outer;
  return env;
};
