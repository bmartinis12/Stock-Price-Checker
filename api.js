'use strict';

const mongoose = require("mongoose");
const { Schema } = mongoose;
const fetch = require("node-fetch");

mongoose.connect(process.env.DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const StockSchema = new Schema({
    symbol: { type: String, required: true },
    likes: { type: Array, defualt: {} }
  });
  const Stock = mongoose.model("Stock", StockSchema)


async function createStock(stock, like, ip){
  console.log("Like" + like)
  const newStock = new Stock({
    symbol: stock,
    likes: [ip]
  });
  const savedNew = await newStock.save();
  return savedNew;
}

async function createStockNoLike(stock, like, ip){
  console.log("Like" + like)
  const newStockNoLike = new Stock({
    symbol: stock,
    likes: []
  });
  const savedNew = await newStockNoLike.save();
  return savedNew;
}

async function findStock(stock){
  return await Stock.findOne({ symbol: stock }).exec();
}

async function saveStock(stock, like, ip){
  let saved = {}
  const foundStock = await findStock(stock);
  if(!foundStock) {
    if(like == true){
      const createsaved = await createStock(stock, like, ip);
      saved = createsaved;
    } else {
      const createsavedNoLike = await createStockNoLike(stock, like, ip);
      saved = createsavedNoLike;
    }
    return saved;
  } else {
    if(like && foundStock.likes.indexOf(ip) === -1){
      foundStock.likes.push(ip);
    }
    saved = await foundStock.save();
    return saved;
  }
}

async function grabStock(stock){
  const res = await fetch(
    `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`
  );
  const { symbol, latestPrice } = await res.json();
  return { symbol, latestPrice };
}

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get( async function (req, res){
      const { stock, like } = req.query;
      if(Array.isArray(stock)){
        const { symbol, latestPrice } = await grabStock(stock[0]);
        const { symbol: symbol2, latestPrice: latestPrice2 } = await grabStock(stock[1]);

        const firstStock = await saveStock(stock[0], like, req.ip);
        const secondStock = await saveStock(stock[1], like, req.ip);
        let stockData = [];
        if(!symbol){
          stockData.push({
            rel_likes: firstStock.likes.length - secondStock.likes.length
          });
        } else {
          stockData.push({
            stock: symbol,
            price: latestPrice,
            rel_likes: firstStock.likes.length - secondStock.likes.length
          });
        }
        if(!symbol2){
          stockData.push({
            rel_likes: secondStock.likes.length - firstStock.likes.length
          });
        } else {
          stockData.push({
            stock: symbol2,
            price: latestPrice2,
            rel_likes: firstStock.likes.length - secondStock.likes.length
          });
        }
        res.json({
          stockData
        });
        console.log(stockData)
        return
        
      }
      const { symbol, latestPrice } = await grabStock(stock);
      if(!symbol){
        res.json({ stockData: { likes: like ? 1 : 0 } });
        return;
      }
      const oneStockData = await saveStock(symbol, like, req.ip);
      res.json({
        stockData: {
          stock: symbol,
          price: latestPrice,
          likes: oneStockData.likes.length
        }
      })
      
    });
    
};
