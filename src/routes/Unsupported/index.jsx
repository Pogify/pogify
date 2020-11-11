import React from "react";
import { isIE, isMobile } from 'react-device-detect';
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";

import styles from "./index.module.css";

export class Unsupported extends React.Component {

	render() {
		if (isMobile || isIE){
			return (
				<div>
					<Helmet>
						<title>Unsupported Device</title>
					</Helmet>
					<div className={styles.container}>
						<center>
							<h2>Mobile is not supported, get on ur pc</h2>
							<Link to="/" style={{textDecoration: "none"}}>
								<div className={styles.backButton}>
									<div className={styles.backIcon}>
										<img src="/back-arrow.svg" alt=""/>
									</div>
									<div className={styles.backText}>
										Go Back
									</div>
								</div>
							</Link>
						</center>
					</div>
				</div>
			)
		}
	}
}

