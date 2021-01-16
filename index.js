require("dotenv").config();

const app = require("./app");

app.listen(process.env.PORT || 5000, () => {
  console.log(`server has started on port ${process.env.PORT}`);
});

