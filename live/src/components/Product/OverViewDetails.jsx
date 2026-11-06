/* eslint-disable react/prop-types */
import { Tabs } from "antd";
import RatingAndReviews from "./RatingAndReviews";
import { useMemo, useState, useEffect } from "react";
import _ from "lodash";
import MixedProductDescripton from "./MixedProductDescripton";

const OverViewDetails = ({
  data = {},
}) => {
  const [activeKey, setActiveKey] = useState("1");

  const tabItems = useMemo(() => {
    const tabs = _.get(data, "description_tabs", []);
    return tabs.map((res, index) => ({
      key: `${index + 1}`,
      label: <span className="!capitalize">{res.name}</span>,
      children: <MixedProductDescripton res={res} />,
    }));
  }, [data]);

  useEffect(() => {
    const tabs = _.get(data, "description_tabs", []);
    if (!_.isEmpty(tabs)) {
      setActiveKey("1");
    } else {
      setActiveKey("1000");
    }
  }, [data]);

  return (
    <div className="w-full flex lg:flex-row flex-col gap-6 ">
      <div id="overview" className="scroll-m-[10vh] w-full lg:w-1/2 ">
        {!_.isEmpty(tabItems) ? (
          <Tabs
            activeKey={activeKey}
            onChange={(key) => setActiveKey(key)}
            items={tabItems}
            type="card"
            className=""
          />
        ) : (
          <div className="p-8 text-center text-gray-400 bg-gray-50 rounded-lg border border-dashed">
            {data?.name ? "No description details available." : "Loading description..."}
          </div>
        )}
      </div>
      <div className="w-full lg:w-1/2 h-full border rounded-xl">
        <RatingAndReviews />
      </div>
    </div>
  );
};

export default OverViewDetails;
