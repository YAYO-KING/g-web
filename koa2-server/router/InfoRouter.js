/**
 * Created by yanyue on 2020/7/1 22:04
 */
const Router = require("koa-router");
const mongoose = require("mongoose");
const InfoCategory = require("../dbs/schema/InfoCategory");
const router = new Router();
const util = require("../utils/util");

router.post("/addCategory", async (ctx) => {
    let body = ctx.request.body;
    //根据返回的数据中infoCategoryId是否有效，判断数据是新增还是编辑
    if (body.infoCategoryId) {
        //编辑
        await InfoCategory.updateOne(
            {infoCategoryId: body.infoCategoryId}, //查询
            {infoCategoryName: body.infoCategoryName},
        ).then(result => {
            if (result) {
                ctx.body = {
                    code: 200,
                    data: result,
                    message: "编辑信息类别成功",
                };
            } else {
                ctx.body = {
                    code: 500,
                    message: "编辑信息类别失败",
                };
            }
        })
    } else {
        //新增
        delete body.infoCategoryId;
        let infoCategory = new InfoCategory(body);
        await infoCategory.save().then((result) => {
            ctx.body = {
                code: 200,
                data: result,
                message: "新增信息类别成功"
            }
        }).catch(error => {
            console.log(error);
            ctx.body = {
                code: 500,
                message: error.errmsg
            }
        })
    }

});

router.get("/getAllCategory", async (ctx) => {
    let categorys = await InfoCategory.find();
    let categorysTemp = categorys.map(item => {
        return {
            infoCategoryName: item.infoCategoryName,
            level: item.level,
            infoCategoryId: item.infoCategoryId,
            parentId: item.parentId
        }
    });
    //需要去掉_id,这个对象形式的_id,不然translateDataToTree将无法执行，出现问题
    if (categorysTemp) {
        let result = {
            list: util.ArrayFn.translateDataToTree(categorysTemp, 'infoCategoryId', 'parentId', 'children')
        };
        ctx.body = {
            code: 200,
            message: "查询成功",
            data: result
        };
    } else {
        ctx.body = {
            code: 500,
            message: "查询失败"
        }
    }
});

//删除信息类别
router.post("/deleteCategory", async (ctx) => {
    let body = ctx.request.body;
    let result = await InfoCategory.remove({"infoCategoryId": body.infoCategoryId});
    if (result) {
        ctx.body = {
            code: 200,
            message: "删除成功",
            data: result
        };
    } else {
        ctx.body = {
            code: 500,
            message: "删除失败"
        }
    }
})


module.exports = router;
