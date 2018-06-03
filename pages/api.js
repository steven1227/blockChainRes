var ApiServer = {
    host= "https://testnet.nebulas.io",
    endpoint= "/v1/user",
    call_api= "/call",
    send_raw_trans= "/rawtransaction",

    nebulas= require("nebulas"),
    Account= nebulas.Account,
    Utils= nebulas.Utils,
    neb= new nebulas.Neb(),
    globalParams = {
        account: null
    },


    comment: function (res_name, comment, star) {
        return {}
    },

    read: function (res_name) {
        return
    },

    readscore: function (res_name) {
        return
    },

    readall: function (res_name) {
        return
    }

    

}