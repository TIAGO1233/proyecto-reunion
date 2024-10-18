const meetingForm = document.getElementById('meetingForm');
const meetingList = document.getElementById('meetingList').querySelector('tbody');

meetingForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const location = document.getElementById('location').value;
    const description = document.getElementById('description').value;

    if (!date || !time || !location || !description) {
        alert('Por favor, completa todos los campos requeridos.');
        return;
    }

    const meeting = {
        date,
        time,
        location,
        description,
        fileName: document.getElementById('fileUpload').files[0] ? document.getElementById('fileUpload').files[0].name : 'No se subió archivo'
    };

    // Agregar reunión a Firestore
    try {
        await db.collection('meetings').add(meeting);
        renderMeetings();
    } catch (error) {
        console.error("Error agregando documento: ", error);
    }

    meetingForm.reset();
});

async function renderMeetings() {
    meetingList.innerHTML = '';
    const querySnapshot = await db.collection('meetings').get();
    const meetings = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    meetings.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));

    meetings.forEach(meeting => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${meeting.date}</td>
            <td>${meeting.time}</td>
            <td>${meeting.location}</td>
            <td>${meeting.description}</td>
            <td>${meeting.fileName}</td>
            <td>
                <button onclick="editMeeting('${meeting.id}')">Editar</button>
                <button onclick="deleteMeeting('${meeting.id}')">Eliminar</button>
            </td>
        `;
        meetingList.appendChild(row);
    });
}

async function editMeeting(id) {
    const meetingRef = db.collection('meetings').doc(id);
    const meeting = await meetingRef.get();
    
    if (meeting.exists) {
        const data = meeting.data();
        document.getElementById('date').value = data.date;
        document.getElementById('time').value = data.time;
        document.getElementById('location').value = data.location;
        document.getElementById('description').value = data.description;
        
        await meetingRef.delete();
        renderMeetings();
    }
}

async function deleteMeeting(id) {
    await db.collection('meetings').doc(id).delete();
    renderMeetings();
}

// Cargar reuniones al inicio
renderMeetings();
