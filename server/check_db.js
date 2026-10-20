const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost:27017/printe")
  .then(async () => {
    const db = mongoose.connection.db;
    const products = await db.collection("product").find({}).toArray();

    const results = products.map((x) => ({
      _id: x._id,
      name: x.name,
      seo_url: x.seo_url,
      is_photobook: x.is_photobook,
      type_of_is_photobook: typeof x.is_photobook,
      has_photobook_config: !!x.photobook_config,
      photobook_config: x.photobook_config,
      sub_category_details: x.sub_category_details,
    }));

    console.log("ALL PRODUCTS COUNT:", results.length);
    console.log("PRODUCTS:", JSON.stringify(results, null, 2));

    const subcats = await db.collection("sub category").find({}).toArray();
    console.log(
      "SUBCATEGORIES:",
      JSON.stringify(
        subcats.map((s) => ({ _id: s._id, name: s.sub_category_name })),
        null,
        2
      )
    );

    process.exit(0);
  })
  .catch((err) => {
    console.error("DB error:", err);
    process.exit(1);
  });
