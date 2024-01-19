// Get DOM elements
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const searchSuggestions = document.getElementById("search-suggestions");
const searchResults = document.getElementById("search-results");
const favoriteList = document.getElementById("favorite-list");
const favoritesButton = document.getElementById("favorites");
const addToFavoriteButton = document.getElementById("add-to-fav");
const mealSection = document.getElementById("meal-section");
const favoriteDropmenu = document.getElementById("favorite-dropmenu");
const mealInstructions = document.getElementById("meal-instructions");
const instructionsHeading = document.getElementById("instructions-heading");

// API from the MEALDB
const API_URL = "https://www.themealdb.com/api/json/v1/1/";

// Function to fetch meal suggestions from the API
async function fetchMealSuggestions(query) {
  try {
    const response = await fetch(`${API_URL}search.php?s=${query}`);
    const data = await response.json();
    return data.meals || [];
  } catch (error) {
    console.error("Error fetching meal suggestions:", error);
    return [];
  }
}

// Function to display meal suggestions
function displaySuggestions(suggestions) {
  searchSuggestions.innerHTML = "";
  suggestions.forEach((meal) => {
    const suggestionItem = document.createElement("li");
    suggestionItem.textContent = meal.strMeal;
    suggestionItem.addEventListener("click", () => {
      searchInput.value = meal.strMeal;
      searchSuggestions.innerHTML = "";
    });
    searchSuggestions.appendChild(suggestionItem);
  });
}

// Function to fetch meal details by name
async function fetchMealDetailsByName(mealName) {
  try {
    const response = await fetch(`${API_URL}search.php?s=${mealName}`);
    const data = await response.json();
    return data.meals ? data.meals[0] : null;
  } catch (error) {
    console.error("Error fetching meal details:", error);
    return null;
  }
}

// Function to get the stored favorite meals from local storage
function getFavoriteMeals() {
  const favorites = localStorage.getItem("favoriteMeals");
  return favorites ? JSON.parse(favorites) : [];
}

// Function to update and display the favorite meals list
async function updateFavoriteList() {
  const favoriteMeals = getFavoriteMeals();
  favoriteList.innerHTML = "";

  for (const mealName of favoriteMeals) {
    const li = document.createElement("li");
    const mealDetails = await fetchMealDetailsByName(mealName);

    if (mealDetails) {
      const mealImage = document.createElement("img");
      mealImage.src = mealDetails.strMealThumb;
      mealImage.alt = mealDetails.strMeal;
      // Set the width and height for the passport size image
      mealImage.style.width = "100px"; // for Adjusting the width
      mealImage.style.height = "100px"; // for Adjusting the height

      li.appendChild(mealImage);

      const mealNameDiv = document.createElement("div");
      mealNameDiv.textContent = mealName;
      li.appendChild(mealNameDiv);

      const deleteButton = document.createElement("button");
      deleteButton.classList.add("fas", "fa-trash");
      deleteButton.addEventListener("click", () => {
        // Remove the meal from the list
        const updatedFavoriteMeals = favoriteMeals.filter(
          (favoriteMeal) => favoriteMeal !== mealName
        );
        localStorage.setItem(
          "favoriteMeals",
          JSON.stringify(updatedFavoriteMeals)
        );
        updateFavoriteList();
      });

      li.appendChild(deleteButton);
      favoriteList.appendChild(li);
    }
  }
}

// Event listener for search input
searchInput.addEventListener("input", async (event) => {
  const query = event.target.value.trim();
  if (query.length >= 1) {
    const suggestions = await fetchMealSuggestions(query);
    displaySuggestions(suggestions);
  } else {
    searchSuggestions.innerHTML = "";
  }
});

// Event listener for search button
searchButton.addEventListener("click", async () => {
  const query = searchInput.value.trim();
  if (query.length >= 1) {
    const suggestions = await fetchMealSuggestions(query);
    if (suggestions.length > 0) {
      const selectedMeal = suggestions[0];
      const imageContainer = document.getElementById("image-container");
      const mealNameContainer = document.getElementById("meal-name");

      imageContainer.innerHTML = `<img src="${selectedMeal.strMealThumb}" alt="${selectedMeal.strMeal}" />`;
      mealNameContainer.textContent = selectedMeal.strMeal;

      const instructions = await fetchMealInstructions(selectedMeal.idMeal);
      mealInstructions.textContent = instructions;

      mealSection.style.display = "block";
      addToFavoriteButton.style.display = "inline-block";
      instructionsHeading.style.display = "block";
    } else {
      searchResults.innerHTML = "No results found.";
    }
  }
});

// Close suggestions on clicking outside the input
document.addEventListener("click", (event) => {
  if (
    !searchInput.contains(event.target) &&
    !searchSuggestions.contains(event.target)
  ) {
    searchSuggestions.innerHTML = "";
  }
});

// Event listener for "add to favorites" button
addToFavoriteButton.addEventListener("click", () => {
  const selectedMealName = document.getElementById("meal-name").textContent;
  const favoriteMeals = getFavoriteMeals();

  if (!favoriteMeals.includes(selectedMealName)) {
    favoriteMeals.push(selectedMealName);
    localStorage.setItem("favoriteMeals", JSON.stringify(favoriteMeals));
    updateFavoriteList();
  }

  favoriteList.style.display = "none";
});

// Event listener to show the stored items on clicking on FAV
favoritesButton.addEventListener("click", () => {
  favoriteDropmenu.style.display = "block";
  favoriteList.style.display = "block";
  updateFavoriteList();
});

// Event listener for clicking outside the fav
document.addEventListener("click", (event) => {
  if (!favoritesButton.contains(event.target)) {
    favoriteDropmenu.style.display = "none";
  }
});

// Display the favorite list
updateFavoriteList();

// Function to fetch meal instructions based on  meal id
async function fetchMealInstructions(mealId) {
  try {
    const response = await fetch(`${API_URL}lookup.php?i=${mealId}`);
    const data = await response.json();
    return data.meals[0].strInstructions;
  } catch (error) {
    console.error("Error fetching meal details:", error);
    return "Instructions are not available";
  }
}
