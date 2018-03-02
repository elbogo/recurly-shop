export default function fetchHelper(url,data) {

    return new Promise(resolve => {
        try{
            fetch(url, {
                method: !!data ? 'POST' : 'GET',
                body: !!data ? JSON.stringify(data): null,
                credentials: 'same-origin',
                headers: new Headers({
                    'Content-Type': 'application/json'
                })
            }).then(res => res.json())
                .catch(error => resolve(error))
                .then(response => resolve(response))

        }catch(err){
            console.error('error while fetching data: ',err)
            resolve(false)
        }
    })


}