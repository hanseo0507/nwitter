import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { dbService, storageService } from "fbase";

import Nweet from "components/Nweet";

const Home = ({ userObj }) => {
	const [nweet, setNweet] = useState("");
	const [nweets, setNweets] = useState([]);
	const [attachment, setAttachment] = useState();

	useEffect(() => {
		dbService.collection("nweets").onSnapshot((snapshot) => {
			const nweetArry = snapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			}));

			setNweets(nweetArry);
		});
	}, []);

	const onSubmit = async (event) => {
		event.preventDefault();
		let attachmentUrl = "";
		if (attachment !== "") {
			const attachmentRef = storageService.ref().child(`${userObj.uid}/${uuidv4()}`);
			const response = await attachmentRef.putString(attachment, "data_url");
			attachmentUrl = await response.ref.getDownloadURL();
		}

		const nweetObj = {
			text: nweet,
			createdAt: Date.now(),
			creatorId: userObj.uid,
			attachmentUrl,
		};
		await dbService.collection("nweets").add(nweetObj);

		setNweet("");
		setAttachment("");
	};

	const onChange = (event) => {
		const {
			target: { value },
		} = event;

		setNweet(value);
	};

	const onFileChange = (event) => {
		const {
			target: { files },
		} = event;

		const theFile = files[0];
		const reader = new FileReader();

		reader.onload = (finishedEvent) => {
			const {
				currentTarget: { result },
			} = finishedEvent;
			setAttachment(result);
		};

		reader.readAsDataURL(theFile);
	};

	const onClearPhoto = () => setAttachment(null);

	return (
		<div>
			<form onSubmit={onSubmit}>
				<input value={nweet} onChange={onChange} type="text" placeholder="What's on your mind?" maxLength={120} />
				<input type="file" accept="image/*" onChange={onFileChange} />
				<input type="submit" value="Nweet" />
				{attachment && (
					<div>
						<img src={attachment} width="50px" height="50px" />
						<button onClick={onClearPhoto}>Clear Photo</button>
					</div>
				)}
			</form>
			<div>
				{nweets.map((nweet) => (
					<Nweet key={nweet.id} nweetObj={nweet} isOnwer={nweet.creatorId === userObj.uid} />
				))}
			</div>
		</div>
	);
};
export default Home;
