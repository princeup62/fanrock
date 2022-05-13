import React, { useEffect, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import moment from "moment";
import { CSVLink } from "react-csv";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";

const App = () => {
  const [stateData, setSateData] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [dateFiltersData, setDateFiltersData] = useState([]);
  const [dateWiseChartData, setDateWiseChart] = useState({
    labels: [],
    datasets: [
      {
        label: "Date Wise Graph",
        data: [],
      },
    ],
  });

  const [productWiseChartData, setProductWiseChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Product Wise Graph",
        data: [],
      },
    ],
  });

  const [selectedStoreName, setSelectedStoreName] = useState("fanjoy.co");

  const [isDataLoading, setIsDataLoading] = useState(false);

  const appendixDropdownData = [
    "gymshark.com",
    "bombas.com",
    "fanjoy.co",
    "boutique.louvre.fr",
    "ca.ultamodan.com",
    "colourpop.com",
    "drsquatch.com",
    "establishedtitles.com",
    "morphe.com",
    "eustore.ifixit.com",
    "farmersmarket.chipotle.com",
    "fentybeauty.com",
    "flyingtiger.com",
    "fr.cupshe.com",
    "fr.roccat.com",
    "hardware.shopify.com",
    "hasbropulse.com",
    "kbdfans.com",
    "kith.com",
    "knix.com",
    "langehair.com",
    "localstealsanddeals.com",
    "modcloth.com",
    "nft.casetify.com",
    "ridge.com",
    "ruggable.com",
    "se-en.ring.com",
    "shapermint.uk",
    "shop.allkpop.com",
    "shop.buzzfeed.com",
    "shop.colgate.com",
    "shop.hulu.com",
    "shop.luvmehair.com",
  ];

  const fethData = async () => {
    try {
      setIsDataLoading(true);
      const response = await axios.get(
        `https://${selectedStoreName}/products.json?page=1&limit=250`
      );
      console.log("response", response.data.products);

      const data = await response.data.products.map((item) => {
        return {
          id: item.id,
          created_at: moment(item.created_at).utc().format("YYYY-MM-DD"),
          product_type: item.product_type,
          vendor: item.vendor,
        };
      });
      setSateData(data);
      setIsDataLoading(false);
    } catch (error) {
      setIsDataLoading(false);
      alert("fetched fail");
      setSateData([]);
    }
  };

  useEffect(() => {
    fethData();
  }, [selectedStoreName]);

  const dateConvertor = (data) => {
    const dateCount = {};
    data.forEach((obj) => {
      if (dateCount[obj.created_at] === undefined) {
        dateCount[obj.created_at] = 1;
      } else dateCount[obj.created_at] += 1;
    });

    console.log(dateCount);

    const dateList = Object.keys(dateCount);

    const arr = dateList.map((date) => {
      return { date: date, count: dateCount[date] };
    });
    return arr;
  };

  const productConvertor = (data) => {
    const dateCount = {};
    data.forEach((obj) => {
      if (dateCount[obj.product_type] === undefined) {
        dateCount[obj.product_type] = 1;
      } else dateCount[obj.product_type] += 1;
    });

    console.log(dateCount);

    const dateList = Object.keys(dateCount);

    const arr = dateList.map((date) => {
      return { product_type: date, count: dateCount[date] };
    });
    return arr;
  };

  useEffect(() => {
    if (stateData.length > 0) {
      setDateFiltersData(() => {
        return dateConvertor(stateData);
      });

      setFilteredProducts(() => {
        return productConvertor(stateData);
      });
    }
  }, [stateData]);

  //for date-wise charts
  useEffect(() => {
    if (dateFiltersData.length > 0) {
      setDateWiseChart({
        labels: dateFiltersData.map((item) => item.date),
        datasets: [
          {
            label: "Date Wise Graph",
            data: dateFiltersData.map((item) => item.count),
          },
        ],
      });
    }
  }, [dateFiltersData]);

  //for product-wise charts
  useEffect(() => {
    if (filteredProducts.length > 0) {
      setProductWiseChartData({
        labels: filteredProducts.map((item) => item.product_type),
        datasets: [
          {
            label: "Product Wise Graph",
            data: filteredProducts.map((item) => item.count),
          },
        ],
      });
    }
  }, [filteredProducts]);

  const productWiseCSVLink = useRef();
  const dateWiseCSVLink = useRef();

  const headersForProductWiseCSV = [
    { label: "Product Type", key: "product_type" },
    { label: "Total Count", key: "count" },
  ];

  const headersForDateWiseCSV = [
    { label: "Date", key: "date" },
    { label: "Total Count", key: "count" },
  ];

  return (
    <div className="container">
      <div class="btn-group my-4" role="group">
        <button
          type="button"
          class="btn btn-outline-primary"
          onClick={() => {
            productWiseCSVLink.current.link.click();
          }}
        >
          Product Wise CSV
          <CSVLink
            filename="product_wise_data.csv"
            data={filteredProducts}
            headers={headersForProductWiseCSV}
            ref={productWiseCSVLink}
            className="hidden"
          />
        </button>
        <button
          type="button"
          class="btn btn-outline-primary"
          onClick={() => {
            dateWiseCSVLink.current.link.click();
          }}
        >
          Date Wise CSV
          <CSVLink
            filename="Date_wise_data.csv"
            data={dateFiltersData}
            headers={headersForDateWiseCSV}
            ref={dateWiseCSVLink}
            className="hidden"
          />
        </button>
      </div>

      <h5>Select Store Name</h5>
      <select
        class="form-select w-25"
        aria-label="Default select example"
        value={selectedStoreName}
        onChange={(e) => {
          setSelectedStoreName(e.target.value);
        }}
      >
        {appendixDropdownData.map((item, index) => {
          return (
            <option value={item} key={index}>
              {item}
            </option>
          );
        })}
      </select>

      {stateData.length > 0 && (
        <div className="row">
          <div className="col-md-5">
            <Bar data={dateWiseChartData} />
          </div>

          <div className="col-md-5 offset-md-2 ">
            <Bar data={productWiseChartData} />
          </div>
        </div>
      )}

      {isDataLoading ? (
        <h1 className="text-primaary">Data Loading...</h1>
      ) : (
        <table class="table table-striped   mt-2">
          <thead>
            <tr>
              <th scope="col">Poduct Id</th>
              <th scope="col">Created At</th>
              <th scope="col">Type</th>
              <th scope="col">Vendor</th>
            </tr>
          </thead>

          <tbody>
            {stateData?.map((item, index) => {
              return (
                <tr>
                  <td>{item.id}</td>
                  <td>{item.created_at}</td>
                  <td>{item.product_type}</td>
                  <td>{item.vendor}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {stateData.length === 0 && !isDataLoading && (
        <div className=" text-danger">
          <h1 className="text-center">No Records Found</h1>
        </div>
      )}
    </div>
  );
};

export default App;
