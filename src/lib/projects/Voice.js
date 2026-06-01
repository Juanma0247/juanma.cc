import { initializeApp, getApps, getApp } from 'firebase/app'
import { getStorage, ref, listAll, getDownloadURL, uploadBytes } from 'firebase/storage'

const firebaseConfig = {
    apiKey: "AIzaSyALR43Li_8to5gVNbV4KewnTD-vzb2TO7M",
    authDomain: "adrian-9b025.firebaseapp.com",
    projectId: "adrian-9b025",
    storageBucket: "adrian-9b025.appspot.com",
    messagingSenderId: "874865052362",
    appId: "1:874865052362:web:f7261f9d8fec6af0940233",
    measurementId: "G-QHCNLD7HVS"
}

class Voice {
    constructor() {
        this.i1 = document.getElementById("p4i1")
        const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
        this.storage = getStorage(app)
    }

    async getAudios() {
        const audioFolder = ref(this.storage, "audios/")
        try {
            const result = await listAll(audioFolder)
            const urls = await Promise.all(
                result.items.map(async (itemRef) => {
                    const url = await getDownloadURL(itemRef)
                    return url
                })
            )
            return urls
        } catch (error) {
            alert("Error listing audios: " + error)
        }
    }

    makeAudio(url, name) {
        const savedAudios = document.getElementById("audiosGuardados")
        const audio = document.createElement("audio")
        audio.innerHTML = `<source src="${url}" type="audio/wav">eMM.`
        savedAudios.appendChild(audio)
        const playButton = document.createElement("button")
        playButton.className = "audioReproButton"
        playButton.textContent = `Play ${name}`
        playButton.addEventListener("click", () => {
            audio.play().then().catch(err => alert("Error: " + err))
        })
        savedAudios.appendChild(playButton)
    }

    main() {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(function(stream) {
                const audioElement = document.createElement('audio')
                audioElement.srcObject = stream
                audioElement.play()
            })
            .catch(function(error) {
                alert('Microphone denied: ' + error)
            })

        let mediaRecorder
        let audioChunks = []
        const startRecordingBtn = document.getElementById("startRecording")
        const stopRecordingBtn = document.getElementById("stopRecording")
        const uploadAudioBtn = document.getElementById("uploadAudio")
        const audioPreview = document.getElementById("audioPreview")

        startRecordingBtn.addEventListener("click", async () => {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            mediaRecorder = new MediaRecorder(stream)
            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data)
            }
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
                const audioUrl = URL.createObjectURL(audioBlob)
                audioPreview.src = audioUrl
                uploadAudioBtn.disabled = false
            }
            mediaRecorder.start()
            startRecordingBtn.disabled = true
            stopRecordingBtn.disabled = false
        })

        stopRecordingBtn.addEventListener("click", () => {
            mediaRecorder.stop()
            startRecordingBtn.disabled = false
            stopRecordingBtn.disabled = true
        })

        uploadAudioBtn.addEventListener("click", () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
            const file = new File([audioBlob], `${this.i1.value}.wav`, { type: 'audio/wav' })
            const storageRef = ref(this.storage, 'audios/' + file.name)
            uploadBytes(storageRef, file).then(() => {
                this.getAudios().then((urls) => {
                    urls.forEach((url) => {
                        this.makeAudio(url, url.split("/").pop().split("?")[0].split("%2F").pop().split(".")[0])
                    })
                })
            }).catch((error) => {
                alert("Error: " + error)
            })
        })

        this.getAudios().then((urls) => {
            urls.forEach((url) => {
                this.makeAudio(url, url.split("/").pop().split("?")[0].split("%2F").pop().split(".")[0])
            })
        })
    }
}

export default Voice
