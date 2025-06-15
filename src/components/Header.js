export default function Header({
  $app,
  initialState,
  handleSortChange,
  handleSearch,
}) {
  this.state = initialState;
  this.$target = document.createElement("div");
  this.$target.className = "header";

  this.handleSearch = handleSearch;
  this.handleSortChange = handleSortChange;

  $app.appendChild(this.$target);

  this.template = () => {
    const { sortBy, searchWord } = this.state;

    let temp = `
      <div class="title">
        <a href="/">✈️ Trip Wiki</a>
      </div>
      <div class="filter-search-container">
        <div class="filter">
          <select id="sortList" class="sort-list">
            <option value="total" ${
              sortBy === "total" ? "selected" : ""
            }>Total</option>
            <option value="cost" ${
              sortBy === "cost" ? "selected" : ""
            }>Cost</option>
            <option value="fun" ${
              sortBy === "fun" ? "selected" : ""
            }>Fun</option>
            <option value="safety" ${
              sortBy === "safety" ? "selected" : ""
            }>Safety</option>
            <option value="internet" ${
              sortBy === "internet" ? "selected" : ""
            }>Internet</option>
            <option value="air" ${
              sortBy === "air" ? "selected" : ""
            }>Air Quality</option>
            <option value="food" ${
              sortBy === "food" ? "selected" : ""
            }>Food</option>
          </select>
        </div>
        <div class="search">
            <input type="text" placeHolder="search" id="search" autocomplete="off" value="${searchWord}" />
        </div>
      </div>
      `;

    return temp;
  };

  this.render = () => {
    this.$target.innerHTML = this.template();
    document.getElementById("sortList").addEventListener("change", (e) => {
      const sortBy = e.target.value;
      this.handleSortChange(sortBy);
    });

    document.getElementById("search").addEventListener("keydown", (e) => {
      const searchWord = e.target.value;
      if (e.key === "Enter") {
        this.handleSearch(searchWord);
      }
    });
  };

  this.setState = (newState) => {
    this.state = newState;
    this.render();
  };

  this.render();
}
