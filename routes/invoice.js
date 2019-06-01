var express = require('express');
var router = express.Router();
var QRCode = require('qrcode');
var axios = require('axios');
// Initialize the client
const ChargeClient = require("lightning-charge-client");
const btcpay = require('btcpay')
const keypair = btcpay.crypto.load_keypair(new Buffer.from(process.env.BTCPAY_PRIV_KEY, 'hex'));
const client = new btcpay.BTCPayClient('https://lightning.filipmartinsson.com', keypair, {merchant: process.env.BTCPAY_MERCHANT_KEY})


/* get invoice. */
router.get('/:id', async function(req, res, next) {

  let invoiceId = req.params.id;
  client.get_invoice(invoiceId)
  .then(invoice => {
    if(invoice.status == "complete" || invoice.status == "paid"){
    //Deliver product
    res.end("<html>Product</html>");
    }
    else{
      res.end("<html>Not paid</html>");
    }
  })
  .catch(err => console.log(err))
});

/* Create invoice. */
router.post('/', function(req, res, next) {
    const dollarAmount = req.body.amount;
    client.create_invoice({price: dollarAmount, currency: 'USD'})
    .then(invoice => {
        console.log(invoice);
        res.render('invoice', { invoiceId: invoice.id});
      })
    .catch(err => console.log(err))
});


module.exports = router;
