const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const expect = chai.expect;

chai.use(chaiHttp);

suite('Functional Tests', function() {
  test('Viewing one stock: GET request to /api/stock-prices/', function(done) {
    chai
      .request(server)
      .get("/api/stock-prices/")
      .set("content-type", "application/json")
      .query({ stock: "GOOG" })
      .end((err, res) => {
        assert.equal(res.status,200);
        assert.equal(res.body.stockData.stock, "GOOG");
        assert.exists(res.body.stockData.price, "GOOG has a price");
        done();
      });
  });
  test('Viewing one stock and liking it: GET request to /api/stock-prices/', function(done) {
    chai
      .request(server)
      .get("/api/stock-prices/")
      .set("content-type", "application/json")
      .query({ stock: "TSLA", like: true })
      .end((err, res) => {
        assert.equal(res.status,200);
        assert.equal(res.body.stockData.stock, "TSLA");
        assert.equal(res.body.stockData.likes, 1)
        assert.exists(res.body.stockData.price, "TSLA has a price");
        done();
      });
  });
  test('Viewing the same stock and liking it again: GET request to /api/stock-prices/', function(done) {
    chai
      .request(server)
      .get("/api/stock-prices/")
      .set("content-type", "application/json")
      .query({ stock: "TSLA", like: true })
      .end((err, res) => {
        assert.equal(res.status,200);
        assert.equal(res.body.stockData.stock, "TSLA");
        assert.equal(res.body.stockData.likes, 1)
        assert.exists(res.body.stockData.price, "TSLA has a price");
        done();
      });
  });
  test('Viewing two stocks: GET request to /api/stock-prices/', function(done) {
    chai
      .request(server)
      .get("/api/stock-prices/")
      .set("content-type", "application/json")
      .query({ stock: ["GOOG", "AMZN"] })
      .end((err, res) => {
        assert.equal(res.status,200);
        assert.equal(res.body.stockData[0].stock, "GOOG");
        assert.equal(res.body.stockData[1].stock, "AMZN");
        done();
      });
  });
  test('Viewing two stocks: GET request to /api/stock-prices/', function(done) {
    chai
      .request(server)
      .get("/api/stock-prices/")
      .set("content-type", "application/json")
      .query({ stock: ["GOOG", "AMZN"], like: true})
      .end((err, res) => {
        assert.equal(res.status,200);
        assert.equal(res.body.stockData[0].stock, "GOOG");
        assert.exists(res.body.stockData[0].rel_likes, "GOOG rel likes");
        assert.exists(res.body.stockData[1].rel_likes, "AMZN rel likes");
        done();
      });
  });
});
