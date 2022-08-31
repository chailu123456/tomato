/*
 * @Author: 宋绍华
 * @Date: 2022-07-26 12:09:54
 * @LastEditTime: 2022-07-26 18:46:24
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\components\module-manage\index.ts
 */
import { ResponseParams } from "@/types/response";
import { getSettingModule } from "@/api/request-modules/product";
export interface ModuleNode {
  value: number;
  label: string;
  level: number;
  parent_id?: number;
  product_id?: number;
  id?: number;
  name?: string;
  parent_name?: string;
  parent_path?: string;
  children?: Array<ModuleNode> | undefined;
}

export interface ModuleObj {
  ids?: number[];
  id?: number[];
  product_module_id: number;
  product_module_name?: string;
  field: string;
}

export interface ModuleEditParam {
  id: number;
  name: string;
  product_id: number;
  children: Array<{
    id: number;
    name: string;
  }>;
}

export interface SimpNode {
  name: string;
  id: number;
}

const dataReverse = (people: Array<ModuleNode>, id: number, parentName?: any) => {
  const newArr = [];
  for (let i = 0; i < people.length; i += 1) {
    const obj: ModuleNode = {
      value: 0,
      label: "",
      level: 0,
      parent_id: 0,
      product_id: 0
    };
    obj.id = people[i]?.value;
    obj.value = people[i]?.value;
    obj.name = people[i]?.label;
    obj.label = people[i]?.label;
    obj.level = people[i]?.level;
    obj.parent_id = people[i]?.parent_id;
    obj.parent_name = parentName;
    obj.product_id = people[i]?.product_id;
    const children = people[i]?.children as Array<ModuleNode>;
    if (children && children.length) {
      obj.children = dataReverse(children, id, obj.name);
    }
    newArr.push(obj);
  }
  return newArr;
};

export const getModuleData = async (product: { id: number; name: string }) => {
  if (!product.id) return;
  const res = await getSettingModule<ResponseParams.ResponseDataSuccess>({
    product_id: product.id
  });
  if (res.code === 200) {
    const data = [
      {
        id: 0,
        value: 0,
        level: 0,
        parent_id: 0,
        parent_name: "",
        children: res.data?.children,
        name: product.name,
        label: product.name,
        product_id: product.id
      }
    ];
    return dataReverse(data, -1);
  } else {
    return [];
  }
};
