const fileInput = document.getElementById("fileInput");
const uploadStatus = document.getElementById("uploadStatus");

function handleDrop(event) {
  event.preventDefault();
  let files = event.dataTransfer.files;
  for (let i = 0; i < files.length; i++) {
    uploadImage(files[i]);
  }
}

document.addEventListener("paste", (event) => {
  const items = (event.clipboardData || event.originalEvent.clipboardData).items;
  for (let index in items) {
    const item = items[index];
    if (item.kind === "file") {
      const blob = item.getAsFile();
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Data = event.target.result.split(",")[1];
        const data = window.atob(base64Data);
        const ia = new Uint8Array(data.length);
        for (let i = 0; i < data.length; i++) {
          ia[i] = data.charCodeAt(i);
        }
        const blob = new Blob([ia.buffer], {type: "image/jpeg"});
        const file = new File([blob], "screenshot.jpg");
        uploadImage(file);
      };
      reader.readAsDataURL(blob);
    }
  }
});
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (file) {
    uploadImage(file);
  }
});
const uploadImage = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  document.querySelector(".upload-btn").textContent = "上传中...";

  fetch("/upload", {method: "POST", body: formData})
    .then((response) => response.json())
    .then((data) => {
      const src = window.location.origin + data[0].src;
      uploadStatus.innerHTML = `
                <div class="alert alert-success">上传成功! 🥳</div>
                <div class="input-group">
                  <input readonly type="text" class="form-control" id="imageUrl" value="${src}">
                  <div class="input-group-append">
                    <button class="btn btn-outline-secondary copy-btn" type="button" onclick="copyImageUrl()">复制 URL</button>
                  </div>
                </div>
                <br />
                <img src="${src}" class="img-fluid mb-3" alt="Uploaded Image">
            `;
    })
    .catch((error) => {
      uploadStatus.innerHTML = '<div class="alert alert-danger">上传失败. 请重新尝试.</div>';
    })
    .finally(() => {
      document.querySelector(".upload-btn").textContent = "上传图片";
    });
};
const copyImageUrl = () => {
  const imageUrl = document.getElementById("imageUrl");
  imageUrl.select();
  document.execCommand("copy");
  document.querySelector(".copy-btn").textContent = "✨ 复制成功";
  setTimeout(() => {
    document.querySelector(".copy-btn").textContent = "复制 URL";
  }, 1000);
};
