$(window).on("load", function () {
  var swiper = new Swiper(".swiper-container .swiper", {
    slidesPerView: 1,
    spaceBetween: 30,
    autoplay: {
      delay: 2500,
      disableOnInteraction: false,
    },
    navigation: {
      nextEl: ".swiper-container .swiper-button-next",
      prevEl: ".swiper-container .swiper-button-prev",
    },
    pagination: {
      el: ".swiper-container .swiper-pagination",
      clickable: true,
    },
  });

  const endPoint = "https://cloud.appwrite.io/v1";
  const projectID = "670ca9e3000765980734";
  const dbID = "670cac14002f48a8847d";
  const collectionID = "670cac3e0038ed087029";
  const bucketID = "670ce3bb0038c97bd758";

  const client = new Appwrite.Client()
    .setEndpoint(endPoint)
    .setProject(projectID);

  const databases = new Appwrite.Databases(client);
  const storage = new Appwrite.Storage(client);

  function showLoader() {
    $(".loader-wrapper").css("display", "flex");
  }
  function hideLoader() {
    $(".loader-wrapper").css("display", "none");
  }

  async function uploadData(data) {
    showLoader();
    const logoId = await uploadFile(data.logo);
    const imageId = await uploadFile(data.image);

    const { textOne, textTwo, textThree } = data;

    try {
      const upload = await databases.createDocument(
        dbID,
        collectionID,
        Appwrite.ID.unique(),
        {
          logo: logoId,
          image: imageId,
          textOne,
          textTwo,
          textThree,
        }
      );
      fetchLatestData();
    } catch (error) {
      alert(error);
    } finally {
      hideLoader();
    }
  }

  async function fetchData() {
    showLoader();
    try {
      const fetch = await databases.listDocuments(dbID, collectionID);
      createLayout(fetch.documents);
    } catch (error) {
      alert(error);
    } finally {
      hideLoader();
    }
  }

  fetchData();

  async function fetchLatestData() {
    const fetch = await databases.listDocuments(dbID, collectionID, [
      Appwrite.Query.orderDesc("$createdAt"),
      Appwrite.Query.limit(1),
    ]);
    createLayout(fetch.documents);
  }

  function createLayout(data) {
    data?.forEach(async function (item) {
      const logoView = await storage.getFileView(bucketID, item.logo);
      const imageView = await storage.getFileView(bucketID, item.image);

      $("#slides-wrapper h2").hide();

      swiper.appendSlide(`
          <div class="swiper-slide">
              <div class="row">
                <div class="col-lg-6">
                  <img src="${imageView.href}" alt="image" class="img-fluid w-100" />
                </div>
                <div class="col-lg-6">
                  <span class="mb-4 d-block">
                    <img src="${logoView.href}" alt="Logo" style="max-width: 100px;" />
                  </span>
                  <h2>${item.textOne}</h2>
                  <h5>${item.textTwo}</h5>
                  <p>${item.textThree}</p>
                </div>
              </div>
          </div>
      `);
    });
  }

  async function uploadFile(file) {
    const fileUpload = await storage.createFile(
      bucketID,
      Appwrite.ID.unique(),
      file
    );
    return fileUpload.$id;
  }

  $("#dataForm").submit(function (e) {
    e.preventDefault();
    const logo = e.target.logo.files[0];
    const image = e.target.image.files[0];
    const textOne = e.target.textOne.value;
    const textTwo = e.target.textTwo.value;
    const textThree = e.target.textThree.value;
    uploadData({ logo, image, textOne, textTwo, textThree });
    e.target.reset();
  });
});
