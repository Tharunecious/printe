/**
 * Photo Book Size Display Utility
 * Guarantees book sizes are displayed using size name and inch measurements only.
 * Strictly avoids showing any centimeter (cm) values in customer-facing UI.
 */

export const formatBookSizeInches = (sizeInput, optionalSizesList = []) => {
  if (!sizeInput) return "";

  // Helper to strip any "(... cm)" or "cm" occurrences
  const stripCm = (str) =>
    String(str || "")
      .replace(/\s*\([^)]*cm[^)]*\)/gi, "")
      .replace(/\s*\b\d+(\.\d+)?\s*[xX×]\s*\d+(\.\d+)?\s*cm\b/gi, "")
      .trim();

  // If sizeInput is an object
  if (typeof sizeInput === "object") {
    const rawName = sizeInput.name || sizeInput.label || sizeInput.title || "";
    const cleanName = stripCm(rawName);

    let win = sizeInput.width_in || sizeInput.width;
    let hin = sizeInput.height_in || sizeInput.height;
    const wcm = sizeInput.width_cm;
    const hcm = sizeInput.height_cm;

    if ((!win || !hin) && wcm && hcm) {
      win = +(Number(wcm) / 2.54).toFixed(1);
      hin = +(Number(hcm) / 2.54).toFixed(1);
    }

    // If cleanName already has dimension like "10x10 in" or "12x12"
    if (
      cleanName &&
      (cleanName.toLowerCase().includes("in") ||
        cleanName.includes('"') ||
        /^\d+(\.\d+)?\s*[xX×]\s*\d+(\.\d+)?/.test(cleanName))
    ) {
      if (!cleanName.toLowerCase().includes("in") && !cleanName.includes('"')) {
        return `${cleanName} in`;
      }
      return cleanName;
    }

    if (win && hin) {
      return cleanName ? `${cleanName} - ${win} x ${hin} in` : `${win} x ${hin} in`;
    }

    return cleanName;
  }

  // If sizeInput is a string
  const str = stripCm(sizeInput);

  // If a list of size objects is provided, try to find a matching size
  if (Array.isArray(optionalSizesList) && optionalSizesList.length > 0) {
    const found = optionalSizesList.find(
      (s) =>
        s &&
        (String(s._id) === str ||
          String(s.id) === str ||
          String(s.name || "").trim().toLowerCase() === str.toLowerCase())
    );
    if (found) {
      return formatBookSizeInches(found);
    }
  }

  // If size is a raw internal ID (e.g. "size-1793345854945-7bdbd"), check localStorage cache
  if (str.startsWith("size-") || str.startsWith("size_") || str.startsWith("pb-size")) {
    try {
      const cached = localStorage.getItem("photobook_template_sizes") || localStorage.getItem("photobook_sizes");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const found = parsed.find(
            (s) =>
              s &&
              (String(s._id) === str ||
                String(s.id) === str ||
                String(s.name || "").trim().toLowerCase() === str.toLowerCase())
          );
          if (found) {
            return formatBookSizeInches(found);
          }
        }
      }
    } catch (e) {}

    // Default friendly fallback for size IDs created in the editor/admin
    return "A4 - 8.27 x 11.69 in";
  }

  // Standard paper sizes commonly used in photobooks
  const STANDARD_PAPER_SIZES = {
    a3: "A3 - 11.69 x 16.54 in",
    a4: "A4 - 8.27 x 11.69 in",
    a5: "A5 - 5.83 x 8.27 in",
  };
  const lowerStr = str.toLowerCase();
  if (STANDARD_PAPER_SIZES[lowerStr]) {
    return STANDARD_PAPER_SIZES[lowerStr];
  }

  // If already ends with in or "
  if (
    str.toLowerCase().endsWith(" in") ||
    str.endsWith('"') ||
    str.toLowerCase().endsWith(" inch")
  ) {
    return str;
  }

  // If pattern like "8x8" or "10 x 10" or "8.5x11"
  if (/^\d+(\.\d+)?\s*[xX×]\s*\d+(\.\d+)?$/.test(str)) {
    return `${str} in`;
  }

  return str;
};

/**
 * Resolves the edition price for a specific page size.
 * Handles size IDs (e.g. 'size-1793345803562-09027'), size names (e.g. 'A4', '10x10 in'),
 * dimension strings, and fuzzy matching across edition.pricing_by_size, edition.size_pricing,
 * and edition.sizes.
 *
 * @param {Object} edition - The edition object (e.g., Softcover, Hardcover)
 * @param {string|Object} sizeIdentifier - The active size ID, name, or size object
 * @param {Array} allSizes - Array of known size objects (templateSizes, photobookConfig.sizes)
 * @returns {number|null} - The customer product price for this edition at the given size
 */
export const resolveEditionPriceForSize = (edition, sizeIdentifier, allSizes = []) => {
  if (!edition) return null;

  // 1. Normalize size string / identifier
  const rawStr = String(
    (typeof sizeIdentifier === "object" && sizeIdentifier !== null
      ? sizeIdentifier.id || sizeIdentifier._id || sizeIdentifier.name
      : sizeIdentifier) || ""
  ).trim();

  const currentStr = rawStr.toLowerCase();

  // 2. Find matched size object from allSizes
  const matchedSize = (allSizes || []).find((s) => {
    if (!s) return false;
    const sId = String(s._id || s.id || "").trim().toLowerCase();
    const sName = String(s.name || s.title || s.label || "").trim().toLowerCase();
    return sId === currentStr || sName === currentStr || (sName && currentStr.includes(sName));
  });

  // Candidate lookup keys
  const candidateKeys = [
    rawStr,
    matchedSize?._id,
    matchedSize?.id,
    matchedSize?.name,
    matchedSize?.title,
    typeof sizeIdentifier === "object" ? sizeIdentifier.name : null,
    typeof sizeIdentifier === "object" ? sizeIdentifier.id : null,
    typeof sizeIdentifier === "object" ? sizeIdentifier._id : null,
  ]
    .filter(Boolean)
    .map((x) => String(x).trim());

  const pbs = edition.pricing_by_size || edition.size_pricing || {};

  // Direct key check
  for (const key of candidateKeys) {
    if (pbs[key]) {
      const item = pbs[key];
      const val =
        item.customer_price ??
        item.customer_product_price ??
        item.price ??
        item.mrp;
      if (val !== undefined && val !== null && val !== "") return Number(val);
    }
  }

  // Case-insensitive key check
  const pbsEntries = Object.entries(pbs);
  for (const [k, item] of pbsEntries) {
    const kLower = k.trim().toLowerCase();
    const isMatch = candidateKeys.some((ck) => ck.toLowerCase() === kLower);
    if (isMatch) {
      const val =
        item.customer_price ??
        item.customer_product_price ??
        item.price ??
        item.mrp;
      if (val !== undefined && val !== null && val !== "") return Number(val);
    }
  }

  // Cross-reference via allSizes (e.g. k is a size ID whose size.name matches matchedSize.name)
  if (matchedSize?.name) {
    const targetName = String(matchedSize.name).trim().toLowerCase();
    for (const [k, item] of pbsEntries) {
      const sz = (allSizes || []).find((s) => String(s._id || s.id) === k);
      if (sz && String(sz.name).trim().toLowerCase() === targetName) {
        const val =
          item.customer_price ??
          item.customer_product_price ??
          item.price ??
          item.mrp;
        if (val !== undefined && val !== null && val !== "") return Number(val);
      }
    }
  }

  // Check if edition has sizes array (edition.sizes: [{ size_id, size_name, customer_price, ... }])
  if (Array.isArray(edition.sizes) && edition.sizes.length > 0) {
    const matchedSizeItem = edition.sizes.find((si) => {
      const siId = String(si._id || si.id || si.size_id || "").toLowerCase();
      const siName = String(si.name || si.size_name || "").toLowerCase();
      return candidateKeys.some(
        (ck) => ck.toLowerCase() === siId || ck.toLowerCase() === siName
      );
    });
    if (matchedSizeItem) {
      const val =
        matchedSizeItem.customer_price ??
        matchedSizeItem.customer_product_price ??
        matchedSizeItem.price ??
        matchedSizeItem.mrp;
      if (val !== undefined && val !== null && val !== "") return Number(val);
    }
  }

  // Fallbacks: edition default pricing
  if (
    edition.customer_price !== undefined &&
    edition.customer_price !== null &&
    edition.customer_price !== ""
  ) {
    return Number(edition.customer_price);
  }
  if (
    edition.price !== undefined &&
    edition.price !== null &&
    edition.price !== ""
  ) {
    return Number(edition.price);
  }
  if (
    edition.price_tag &&
    /^\d+$/.test(String(edition.price_tag).replace(/[^0-9]/g, ""))
  ) {
    return Number(String(edition.price_tag).replace(/[^0-9]/g, ""));
  }

  return null;
};

/**
 * Returns full pricing details for an edition at a given size
 */
export const getEditionPricingDetailsForSize = (edition, sizeIdentifier, allSizes = []) => {
  if (!edition) return null;

  const rawStr = String(
    (typeof sizeIdentifier === "object" && sizeIdentifier !== null
      ? sizeIdentifier.id || sizeIdentifier._id || sizeIdentifier.name
      : sizeIdentifier) || ""
  ).trim();

  const currentStr = rawStr.toLowerCase();

  const matchedSize = (allSizes || []).find((s) => {
    if (!s) return false;
    const sId = String(s._id || s.id || "").trim().toLowerCase();
    const sName = String(s.name || s.title || s.label || "").trim().toLowerCase();
    return sId === currentStr || sName === currentStr || (sName && currentStr.includes(sName));
  });

  const candidateKeys = [
    rawStr,
    matchedSize?._id,
    matchedSize?.id,
    matchedSize?.name,
    matchedSize?.title,
    typeof sizeIdentifier === "object" ? sizeIdentifier.name : null,
    typeof sizeIdentifier === "object" ? sizeIdentifier.id : null,
    typeof sizeIdentifier === "object" ? sizeIdentifier._id : null,
  ]
    .filter(Boolean)
    .map((x) => String(x).trim());

  const pbs = edition.pricing_by_size || edition.size_pricing || {};

  let sizePricingObj = null;

  for (const key of candidateKeys) {
    if (pbs[key]) {
      sizePricingObj = pbs[key];
      break;
    }
  }

  if (!sizePricingObj) {
    const pbsEntries = Object.entries(pbs);
    for (const [k, item] of pbsEntries) {
      const kLower = k.trim().toLowerCase();
      if (candidateKeys.some((ck) => ck.toLowerCase() === kLower)) {
        sizePricingObj = item;
        break;
      }
    }
  }

  if (!sizePricingObj && matchedSize?.name) {
    const targetName = String(matchedSize.name).trim().toLowerCase();
    for (const [k, item] of Object.entries(pbs)) {
      const sz = (allSizes || []).find((s) => String(s._id || s.id) === k);
      if (sz && String(sz.name).trim().toLowerCase() === targetName) {
        sizePricingObj = item;
        break;
      }
    }
  }

  const customerPrice =
    sizePricingObj?.customer_price ??
    sizePricingObj?.customer_product_price ??
    sizePricingObj?.price ??
    edition.customer_price ??
    edition.price ??
    null;

  const mrp = sizePricingObj?.mrp ?? edition.mrp ?? null;
  const extraPagePrice =
    sizePricingObj?.extra_page_price ??
    edition.price_per_extra_page ??
    matchedSize?.extra_page_price ??
    15;

  return {
    customerPrice: customerPrice !== null && customerPrice !== "" ? Number(customerPrice) : null,
    mrp: mrp !== null && mrp !== "" ? Number(mrp) : null,
    extraPagePrice: Number(extraPagePrice),
    defaultPages: Number(edition.default_pages || 20),
    minPages: Number(edition.min_pages || 10),
    maxPages: Number(edition.max_pages || 60),
  };
};


