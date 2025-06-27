const esp32IP = "http://192.168.1.100"; // Thay bằng IP thật của bạn
let weightInterval;

function loadUsers() {
  const stored = localStorage.getItem("userList");
  return stored ? JSON.parse(stored) : { "admin": "admin123" };
}

function saveUsers(users) {
  localStorage.setItem("userList", JSON.stringify(users));
}

function handleLogin(event) {
  event.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const users = loadUsers();

  if (users[username] && users[username] === password) {
    document.getElementById("userDisplay").textContent = username;
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("dashboard").style.display = "block";
    document.getElementById("errorMessage").textContent = "";
    startFetchingWeight();
  } else {
    document.getElementById("errorMessage").textContent = "Sai tên đăng nhập hoặc mật khẩu!";
    document.getElementById("password").value = "";
  }
}

function handleRegister(event) {
  event.preventDefault();
  const newUser = document.getElementById("newUsername").value.trim();
  const newPass = document.getElementById("newPassword").value;
  const users = loadUsers();

  if (users[newUser]) {
    document.getElementById("registerMessage").textContent = "Tên đã tồn tại!";
    return;
  }

  users[newUser] = newPass;
  saveUsers(users);
  document.getElementById("registerMessage").textContent = "Đăng ký thành công! Mời đăng nhập.";
  document.getElementById("newUsername").value = "";
  document.getElementById("newPassword").value = "";
  setTimeout(showLogin, 1000);
}

function showRegister() {
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("registerForm").style.display = "block";
}

function showLogin() {
  document.getElementById("registerForm").style.display = "none";
  document.getElementById("loginForm").style.display = "block";
}

function logout() {
  document.getElementById("loginForm").style.display = "block";
  document.getElementById("dashboard").style.display = "none";
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
  stopFetchingWeight();
}

function startFetchingWeight() {
  fetchWeight();
  weightInterval = setInterval(fetchWeight, 5000);
}

function stopFetchingWeight() {
  clearInterval(weightInterval);
}

async function fetchWeight() {
  try {
    const res = await fetch(`${esp32IP}/weight`);
    const data = await res.json();
    const weight = parseFloat(data.weight).toFixed(1);

    document.getElementById("weightValue").textContent = `${weight} kg`;

    let advice = "";
    if (weight < 45) advice = "Bạn hơi gầy, nên ăn uống đầy đủ.";
    else if (weight < 60) advice = "Bạn có cân nặng lý tưởng, duy trì nhé!";
    else if (weight < 75) advice = "Bạn hơi dư cân. Nên vận động nhiều hơn.";
    else advice = "Cân nặng khá cao, hãy chú ý sức khoẻ.";

    document.getElementById("advice").textContent = advice;
  } catch (err) {
    document.getElementById("weightValue").textContent = "-- kg";
    document.getElementById("advice").textContent = "Không kết nối được ESP32.";
    console.error("Lỗi ESP32:", err);
  }
}
